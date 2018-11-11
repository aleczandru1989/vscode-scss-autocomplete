import * as fs from 'fs';
import * as vscode from 'vscode';
import { getSCSSLanguageService } from 'vscode-css-languageservice';
import { TextDocument } from 'vscode-languageclient';
import { Location, Position, Range, SymbolInformation, SymbolKind } from 'vscode-languageserver-types';
import URI from 'vscode-uri';

import { NodeType } from '../models/nodetype';
import { SymbolCache } from '../models/symbol';
import { LoggerService } from './logger.service';

export class SymbolService {
    private languageService = getSCSSLanguageService();

    public symbols: SymbolCache[] = [];

    constructor(private loggerService: LoggerService) {
        this.scanForSymbols();
    }

    public async scanForSymbols() {
        const uris: URI[] = await vscode.workspace.findFiles('**/*.scss', null, 99999);
        const promises: Promise<Symbol>[] = [];

        let i = 0;

        uris.forEach(uri => {
            promises.push(new Promise((resolve) => {
                fs.readFile(uri.fsPath, (err, buffer) => {
                    if (err) {
                        this.loggerService.loggError(`Could not read file from path '${uri.fsPath}'`);
                    } else {
                        this.createSymbolCache(uri, buffer.toString());
                    }

                    resolve();
                });
            }));
        });

        return Promise.all(promises);
    }

    public createSymbolInformation(document: vscode.TextDocument, name: string, kind: SymbolKind): SymbolInformation {
        const startPosition = Position.create(0, 0);
        const endPosition = Position.create(0, name.length);

        return {
            name: name,
            kind: kind,
            location: Location.create(document.uri.fsPath, Range.create(startPosition, endPosition))
        };
    }

    private createSymbolCache(fileUri: URI, fileContent: string) {
        const document = TextDocument.create(fileUri.fsPath, 'scss', 1, fileContent);
        const stylesheet: any = this.languageService.parseStylesheet(document);

        if (stylesheet.children && stylesheet.children.length > 0) {
            const symbols = this.languageService.findDocumentSymbols(document, stylesheet);

            this.symbols.push({
                filePath: fileUri.fsPath,
                workspace: vscode.workspace.getWorkspaceFolder(fileUri),
                imports: this.getSymbols(stylesheet, document, SymbolKind.Namespace),
                variables: symbols.filter(x => x.kind === SymbolKind.Variable)
            });
        }
    }

    private getSymbols(stylesheet: any, document: TextDocument, kind: SymbolKind): SymbolInformation[] {
        const imports: Array<any> = stylesheet.children.filter(x => x.type === NodeType.Import);
        const symbolInformation: SymbolInformation[] = [];

        imports.forEach(node => symbolInformation.push({
            name: node.getText(),
            kind: kind,
            location: Location.create(document.uri, this.getRange(node, document))
        }));

        return symbolInformation;
    }

    public getByDocumentWorkspace(document: vscode.TextDocument): SymbolCache[] {
        return this.symbols.filter(x => x.workspace.name === vscode.workspace.getWorkspaceFolder(document.uri).name);
    }

    private getRange(node: any, document: TextDocument): Range {
        return Range.create(document.positionAt(node.offset), document.positionAt(node.end));
    }
}