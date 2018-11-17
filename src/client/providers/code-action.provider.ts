import * as vscode from 'vscode';
import { SymbolService } from '../services/symbol.service';
import { formatSymbolImport, relativePath } from '../utils/formatter';


export class SCSSCodeActionProvider implements vscode.CodeActionProvider {

    constructor(private serviceProvider: SymbolService) { }

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
        this.serviceProvider.updateCacheByUri(document.uri);

        const actions = new Array<vscode.CodeAction>();
        const wordRange = document.getWordRangeAtPosition(range.start);
        const word = document.getText(wordRange);

        const caches = this.serviceProvider.documentCache.filter(x => x.variables.find(y => y.name === word));
        const currentSymbol = this.serviceProvider.documentCache.find(x => x.document.uri.fsPath === document.uri.fsPath);

        caches.forEach(cache => {
            const isExistingImport = currentSymbol.imports.find(x => x.name === formatSymbolImport(document.uri.fsPath, cache.document.uri.fsPath));

            if (!isExistingImport) {
                actions.push({
                    title: relativePath(document.uri.fsPath, cache.document.uri.fsPath),
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
