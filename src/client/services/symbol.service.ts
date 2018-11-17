import * as vscode from 'vscode';
import { getSCSSLanguageService, SymbolKind } from 'vscode-css-languageservice';
import URI from 'vscode-uri';
import { DocumentCache, SymbolCacheImport } from '../models/document';
import { NodeType } from '../models/nodetype';
import { Node, StyleSheet } from '../models/stylesheet';
import { absolutePathFromImport } from '../utils/formatter';
import { isSupportedImport } from '../utils/validator';
import { LoggerService } from './logger.service';

export class SymbolService {
    private languageService = getSCSSLanguageService();
    public documentCache: DocumentCache[] = [];

    constructor(private loggerService: LoggerService) {
    }

    public async createDocumentSymbolCache(): Promise<void> {
        //TODO: Use user information for patterns
        const uris: vscode.Uri[] = await vscode.workspace.findFiles('**/*.scss');

        for (const uri of uris) {
            const document: any = await vscode.workspace.openTextDocument(uri);
            const stylesheet = <StyleSheet>this.languageService.parseStylesheet(document);
            const workspace = vscode.workspace.getWorkspaceFolder(uri);

            const cache = new DocumentCache(document, stylesheet, workspace);
            cache.imports = this.getImportSymbols(cache);

            this.documentCache.push(cache);
        }

        for (const cache of this.documentCache) {
            cache.variables = this.getSymbolsByImports(cache, SymbolKind.Variable, NodeType.VariableDeclaration);
        }
    }

    public updateCacheByUri(uri: URI) {
        vscode.workspace.openTextDocument(uri).then((document: vscode.TextDocument) => {
            const cache = this.documentCache.find(x => x.document.uri.fsPath === uri.fsPath);
            cache.document = document;
            cache.imports = this.getImportSymbols(cache);
            cache.variables = this.getSymbolsByImports(cache, SymbolKind.Variable, NodeType.VariableDeclaration);
        });
    }

    public getByDocumentWorkspace(document: vscode.TextDocument): DocumentCache[] {
        return this.documentCache.filter(x => x.workspace.name === vscode.workspace.getWorkspaceFolder(document.uri).name);
    }

    private getSymbolsByImports(cache: DocumentCache, kind: SymbolKind, nodeType: NodeType): vscode.SymbolInformation[] {
        let variables = this.getSymbols(cache, kind, nodeType);

        cache.imports.forEach(importSymbol => {
            if (isSupportedImport(importSymbol.name)) {
                const importCache = this.documentCache.find(x => x.document.uri.fsPath === importSymbol.fsDocPath);

                if (importCache) {
                    variables = variables.concat(this.getSymbolsByImports(importCache, kind, nodeType));
                } else {
                    this.loggerService.loggWarning(`Document from '${cache.document.uri.fsPath}' with import rule '${importSymbol.name}' could not resolve path '${importSymbol.fsDocPath}'`);
                }
            }
        });

        return variables;
    }

    private getImportSymbols(cache: DocumentCache): SymbolCacheImport[] {
        const imports = <Array<SymbolCacheImport>>this.getSymbols(cache, SymbolKind.Namespace, NodeType.Import);

        imports.forEach((importSymbol: SymbolCacheImport) => {
            importSymbol.fsDocPath = absolutePathFromImport(cache.document.uri.fsPath, importSymbol.name);
        });

        return imports;
    }

    private getSymbols(cache: DocumentCache, kind: SymbolKind, nodeType: NodeType): vscode.SymbolInformation[] {
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