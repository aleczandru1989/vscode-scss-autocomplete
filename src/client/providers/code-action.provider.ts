import * as path from 'path';
import * as vscode from 'vscode';
import { SymbolService } from '../services/symbol.service';
import { formatSymbolImport } from '../utils/formatter';
import { isExistingImport } from './../commands/autoimport.command';

export class SCSSCodeActionProvider implements vscode.CodeActionProvider {

    constructor(private symbolService: SymbolService) { }

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
        this.symbolService.update(document.uri);
        const actions = new Array<vscode.CodeAction>();
        const wordRange = document.getWordRangeAtPosition(range.start);
        const word = document.getText(wordRange);

        //TODO: get caches from current workspace
        const symbolCaches = this.symbolService.getByDocumentWorkspace(document);

        const caches = symbolCaches.filter(x => x.variables.find(y => y.name === word));
        const currentSymbol = symbolCaches.find(x => x.document.uri.fsPath === document.uri.fsPath);

        caches.forEach(cache => {
            const importPath = formatSymbolImport(document.uri.fsPath, cache.document.uri.fsPath);

            if (!isExistingImport(currentSymbol, importPath)) {
                const pathToImport = importPath.replace('@import', '');
                const importMessage = `Add '${path.basename(cache.document.uri.fsPath)}' from '${pathToImport}'`;

                actions.push({
                    title: importMessage,
                    command: {
                        title: 'Trigger Auto import',
                        command: 'scss.toolkit.autoimport',
                        arguments: [document, cache]

                    }
                });
            }
        });

        return actions;
    }
}
