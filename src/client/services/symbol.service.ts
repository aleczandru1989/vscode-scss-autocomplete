import * as vscode from 'vscode';
import { getSCSSLanguageService, SymbolKind } from 'vscode-css-languageservice';
import URI from 'vscode-uri';
import { SymbolCache, SymbolImport } from '../models/document';
import { NodeType } from '../models/nodetype';
import { Node, StyleSheet } from '../models/stylesheet';
import { absolutePathFromImport } from '../utils/formatter';
import { getTime } from '../utils/time';
import { LoggerService } from './logger.service';

export class SymbolService {
    private languageService = getSCSSLanguageService();
    public symbolCaches: SymbolCache[] = [];

    constructor(private loggerService: LoggerService) {
    }

    public async createDocumentSymbolCache(): Promise<void> {
        await this.createSymbolCaches();

        this.setSymbolDependencies();
    }

    public updateCacheByUri(uri: URI) {
        // vscode.workspace.openTextDocument(uri).then((document: vscode.TextDocument) => {
        //     const cache = this.documentCache.find(x => x.document.uri.fsPath === uri.fsPath);
        //     cache.document = document;
        //     cache.imports = this.getImportSymbols(cache);
        //     cache.variables = this.getSymbolsByImports(cache, SymbolKind.Variable, NodeType.VariableDeclaration);
        // });
    }

    public getByDocumentWorkspace(document: vscode.TextDocument): SymbolCache[] {
        return this.symbolCaches.filter(x => x.workspace.name === vscode.workspace.getWorkspaceFolder(document.uri).name);
    }

    private setSymbolDependencies() {
        this.loggerService.loggInfo(`SCSS Toolkit has started configuring symbols at  ${getTime()}`);

        for (const symbolCache of this.symbolCaches) {
            symbolCache.isPublic = this.isPublicSymbol(symbolCache);

            symbolCache.children = this.getSymbolCachesByPaths(symbolCache.imports.map(x => x.fsPath));

            symbolCache.variables = this.getSymbols(symbolCache, SymbolKind.Variable, NodeType.VariableDeclaration);
        }

        this.loggerService.loggInfo(`SCSS Toolkit has finished configuring symbols at  ${getTime()}`);
    }

    private async createSymbolCaches() {
        //TODO: get this from config
        const pattern = '**/*.scss';
        this.loggerService.loggInfo(`SCSS Toolkit has started searching for files with pattern ${pattern} at ${getTime()}`);

        const uris: vscode.Uri[] = await vscode.workspace.findFiles(pattern, '**/node_modules/**');

        this.loggerService.loggInfo(`SCSS Toolkit has finished searching for files at ${getTime()}`);

        this.loggerService.loggInfo(`SCSS Toolkit has started creating symbols at  ${getTime()}`);

        for (const uri of uris) {
            await this.createSymbolCache(uri);
        }

        this.loggerService.loggInfo(`SCSS Toolkit has finished creating symbols at ${getTime()}`);
    }


    private async createSymbolCache(uri: vscode.Uri) {
        const existingSymbolCache = this.getSymbolCacheByPath(uri.fsPath, false);

        if (!existingSymbolCache) {
            const symbolCache = await this.createSymbol(uri);

            symbolCache.imports = this.getImportSymbols(symbolCache);

            for (const symbolImport of symbolCache.imports) {
                if (symbolImport.fsPath) {
                    await this.createSymbolCache(vscode.Uri.file(symbolImport.fsPath));
                }
            }

            this.symbolCaches.push(symbolCache);
        }
    }

    private async createSymbol(uri: vscode.Uri) {
        const document: any = await vscode.workspace.openTextDocument(uri);
        const workspace = vscode.workspace.getWorkspaceFolder(uri);

        const stylesheet = <StyleSheet>this.languageService.parseStylesheet(document);
        stylesheet.children = stylesheet.children ? stylesheet.children : [];

        return new SymbolCache(document, stylesheet, workspace);
    }

    private getSymbolCachesByPaths(fsPaths: string[]): SymbolCache[] {
        const symbolCaches = [];

        fsPaths.forEach(fsPath => {
            const symbolCache = this.getSymbolCacheByPath(fsPath);

            if (symbolCache) {
                symbolCaches.push(symbolCache);
            }
        });

        return symbolCaches;
    }

    private getSymbolCacheByPath(fsPath: string, isErrorLoginEnabled = true): SymbolCache {
        const symbolCache = this.symbolCaches.find(x => x.document.uri.fsPath === fsPath);

        if (!symbolCache && isErrorLoginEnabled) {
            this.loggerService.loggWarning(`SymbolCache with fsPath '${fsPath}' could not be resolved`);
        }

        return symbolCache;
    }

    private getParentSymbols(fsPath: string): SymbolCache[] {
        return this.symbolCaches
            .filter(x => x.imports.find(y => y.fsPath === fsPath));
    }

    private isPublicSymbol(symbolCache: SymbolCache, isRoot = true): boolean {
        let isPublic = symbolCache.stylesheet.children.filter(child => !this.isPublicNode(child.type)).length === 0;

        symbolCache.imports.forEach(symbolImport => {
            const symbolCache = this.getSymbolCacheByPath(symbolImport.fsPath);

            if (symbolCache) {
                isPublic = isPublic && this.isPublicSymbol(symbolCache, false);
            }
        });

        if (isRoot) {
            this.getParentSymbols(symbolCache.document.uri.fsPath).forEach((parentSymbol) => {
                isPublic = isPublic && !this.isPublicSymbol(parentSymbol);
            });
        }

        return isPublic;
    }

    private isPublicNode(type: NodeType) {
        return type === NodeType.VariableDeclaration ||
            type === NodeType.MixinDeclaration ||
            type === NodeType.Import;
    }

    private getImportSymbols(cache: SymbolCache): SymbolImport[] {
        const imports = <Array<SymbolImport>>this.getSymbols(cache, SymbolKind.Namespace, NodeType.Import);

        imports.forEach((importSymbol: SymbolImport) => {
            importSymbol.fsPath = absolutePathFromImport(cache.document.uri.fsPath, importSymbol.name);
        });

        return imports;
    }

    private getSymbols(cache: SymbolCache, kind: SymbolKind, nodeType: NodeType): vscode.SymbolInformation[] {
        const symbolInformation: vscode.SymbolInformation[] = [];

        if (cache.stylesheet.children && cache.stylesheet.children.length > 0) {
            const nodes = cache.stylesheet.children.filter(x => x.type === nodeType);

            nodes.forEach(node => symbolInformation.push({
                containerName: '',
                name: node.getText(),
                kind: kind,
                location: new vscode.Location(cache.document.uri, this.getRange(node, cache.document))
            }));
        }

        return symbolInformation;
    }

    private getRange(node: Node, document: vscode.TextDocument): vscode.Range {
        return new vscode.Range(document.positionAt(node.offset), document.positionAt(node.end));
    }
}