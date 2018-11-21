import * as vscode from 'vscode';
import { getSCSSLanguageService, SymbolKind } from 'vscode-css-languageservice';
import URI from 'vscode-uri';
import { SymbolCache, SymbolImport, SymbolVariable } from '../models/document';
import { NodeType } from '../models/nodetype';
import { Node, StyleSheet } from '../models/stylesheet';
import { ServiceProvider } from '../providers/service.provider';
import { fsPathForImport } from '../utils/formatter';
import { getTime } from '../utils/time';
import { LoggerService } from './logger.service';

export class SymbolService {
    private languageService = getSCSSLanguageService();
    public symbolCaches: SymbolCache[] = [];

    constructor(private loggerService: LoggerService) {
    }

    public async createDocumentSymbolCache(): Promise<void> {
        await this.createSymbolCaches();

        this.setSymbolsConfig();
    }

    public update(uri: URI) {
        vscode.workspace.openTextDocument(uri).then((document: vscode.TextDocument) => {
            const symbolCache = this.symbolCaches.find(x => x.document.uri.fsPath === uri.fsPath);
            symbolCache.document = document;
            symbolCache.stylesheet = this.createStyleSheet(document);
            symbolCache.imports = this.getImportSymbols(symbolCache);

            this.setSymbolConfig(symbolCache);
        });
    }

    public delete(uri: URI) {
        this.symbolCaches.forEach((cache, index) => {
            if (cache.document.uri.fsPath === uri.fsPath) {
                this.symbolCaches.splice(index, 1);
            }
        });
    }

    public async create(uri: vscode.Uri) {
        const existingSymbolCache = this.getSymbolCacheByPath(uri.fsPath, false);

        if (!existingSymbolCache) {
            const symbolCache = await this.createSymbol(uri);

            symbolCache.imports = this.getImportSymbols(symbolCache);

            for (const symbolImport of symbolCache.imports) {
                if (symbolImport.fsPath) {
                    await this.create(vscode.Uri.file(symbolImport.fsPath));
                }
            }

            this.symbolCaches.push(symbolCache);
        }
    }

    public getSymbolsByWorkspace(document: vscode.TextDocument): SymbolCache[] {
        return this.symbolCaches.filter(x => x.workspace.name === vscode.workspace.getWorkspaceFolder(document.uri).name);
    }

    public getSymbolByUri(uri: URI) {
        return this.symbolCaches.find(x => x.document.uri.fsPath === uri.fsPath);
    }

    private setSymbolsConfig() {
        this.loggerService.loggInfo(`SCSS Toolkit has started configuring symbols at  ${getTime()}`);

        for (const symbolCache of this.symbolCaches) {
            this.setSymbolConfig(symbolCache);
        }

        this.loggerService.loggInfo(`SCSS Toolkit has finished configuring symbols at  ${getTime()}`);
    }

    private setSymbolConfig(symbolCache: SymbolCache) {
        symbolCache.isPublic = this.isPublicSymbol(symbolCache);

        symbolCache.children = this.getSymbolCachesByPaths(symbolCache.imports.map(x => x.fsPath));

        symbolCache.variables = this.getVariableSymbols(symbolCache);
    }

    private async createSymbolCaches() {
        this.loggerService.loggInfo(`SCSS Toolkit has started searching for files with pattern ${ServiceProvider.settings.includePattern} at ${getTime()}`);

        const uris: vscode.Uri[] = await vscode.workspace.findFiles(ServiceProvider.settings.includePattern, ServiceProvider.settings.excludePattern);

        this.loggerService.loggInfo(`SCSS Toolkit has finished searching for files at ${getTime()}`);

        this.loggerService.loggInfo(`SCSS Toolkit has started creating symbols at  ${getTime()}`);

        for (const uri of uris) {
            await this.create(uri);
        }

        this.loggerService.loggInfo(`SCSS Toolkit has finished creating symbols at ${getTime()}`);
    }

    private async createSymbol(uri: vscode.Uri) {
        const document = await vscode.workspace.openTextDocument(uri);
        const workspace = vscode.workspace.getWorkspaceFolder(uri);
        const styleSheet = this.createStyleSheet(document);

        return new SymbolCache(document, styleSheet, workspace);
    }

    private createStyleSheet(document: vscode.TextDocument): StyleSheet {
        const stylesheet = <StyleSheet>this.languageService.parseStylesheet(<any>document);

        stylesheet.children = stylesheet.children ? stylesheet.children : [];

        return stylesheet;
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

        if (!symbolCache && isErrorLoginEnabled && fsPath) {
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

    private getImportSymbols(symbolCache: SymbolCache): SymbolImport[] {
        return this.getSymbols((node: Node) => {
            const symbol = new SymbolImport(node.getText(), SymbolKind.Namespace, this.getRange(node, symbolCache.document));

            symbol.fsPath = fsPathForImport(symbolCache.document.uri.fsPath, symbol.name);

            return symbol;
        }, symbolCache, NodeType.Import);
    }

    private getVariableSymbols(symbolCache: SymbolCache): SymbolVariable[] {
        return this.getSymbols((node: Node) => {
            const symbol = new SymbolVariable(node.children[0].getText(), SymbolKind.Variable, this.getRange(node, symbolCache.document));

            symbol.value = node.children[1].getText();

            return symbol;
        }, symbolCache, NodeType.VariableDeclaration);
    }

    private getSymbols<T>(createSymbol: (node: Node) => T, symbolCache: SymbolCache, nodeType: NodeType): T[] {
        const symbols: T[] = [];

        const nodes = symbolCache.stylesheet.children.filter(x => x.type === nodeType);

        nodes.forEach((node) => symbols.push(createSymbol(node)));

        return symbols;
    }

    private getRange(node: Node, document: vscode.TextDocument): vscode.Range {
        return new vscode.Range(document.positionAt(node.offset), document.positionAt(node.end));
    }
}