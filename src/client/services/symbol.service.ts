import * as vscode from 'vscode';
import { getSCSSLanguageService } from 'vscode-css-languageservice';
import { TextDocument } from 'vscode-languageclient';
import { Location, Range, SymbolInformation, SymbolKind } from 'vscode-languageserver-types';
import URI from 'vscode-uri';

import { DocumentCache } from '../models/document';
import { NodeType } from '../models/nodetype';
import { triggerReadFile } from '../utils/runner';
import { LoggerService } from './logger.service';

export class SymbolService {
    private languageService = getSCSSLanguageService();
    public symbols: DocumentCache[] = [];

    constructor(private loggerService: LoggerService) {
    }

    public async createDocumentSymbolCache() {
        const uris: URI[] = await vscode.workspace.findFiles('**/*.scss', null, 99999);
        const promises: Promise<Symbol>[] = [];

        uris.forEach(uri => {
            promises.push(new Promise((resolve) => {
                triggerReadFile<Symbol>((content: string) => {
                    const symbolCache = this.createDocumentCache(uri, content);
                    const isExistingSymbolCache = this.symbols.find(x => x.fsPath === uri.fsPath);

                    if (symbolCache && !isExistingSymbolCache) {
                        this.symbols.push(symbolCache);
                    }
                }, uri.fsPath, resolve);
            }));
        });

        return Promise.all(promises);
    }

    public updateDocumentSymbolCache(uri: URI) {
        vscode.workspace.openTextDocument(uri).then((document: vscode.TextDocument) => {
            this.symbols.forEach((symbol, index) => {
                if (symbol.fsPath === document.uri.fsPath) {
                    this.symbols[index] = this.createDocumentCache(document.uri, document.getText());
                }
            });
        });
    }

    private createDocumentCache(fileUri: URI, fileContent: string): DocumentCache {
        const document = TextDocument.create(fileUri.fsPath, 'scss', 1, fileContent);
        const stylesheet: any = this.languageService.parseStylesheet(document);

        if (stylesheet.children && stylesheet.children.length > 0) {
            const symbols = this.languageService.findDocumentSymbols(document, stylesheet);

            return {
                fsPath: fileUri.fsPath,
                workspace: vscode.workspace.getWorkspaceFolder(fileUri),
                imports: this.getSymbols(stylesheet, document, SymbolKind.Namespace, NodeType.Import),
                variables: symbols.filter(x => x.kind === SymbolKind.Variable)
            };
        }
    }

    private getSymbols(stylesheet: any, document: TextDocument, kind: SymbolKind, nodeType: NodeType): SymbolInformation[] {
        const imports: Array<any> = stylesheet.children.filter(x => x.type === nodeType);
        const symbolInformation: SymbolInformation[] = [];

        imports.forEach(node => symbolInformation.push({
            name: node.getText(),
            kind: kind,
            location: Location.create(document.uri, this.getRange(node, document))
        }));

        return symbolInformation;
    }

    public getByDocumentWorkspace(document: vscode.TextDocument): DocumentCache[] {
        return this.symbols.filter(x => x.workspace.name === vscode.workspace.getWorkspaceFolder(document.uri).name);
    }

    private getRange(node: any, document: TextDocument): Range {
        return Range.create(document.positionAt(node.offset), document.positionAt(node.end));
    }
}