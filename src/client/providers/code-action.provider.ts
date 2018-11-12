import * as vscode from 'vscode';

import { SymbolService } from '../services/symbol.service';
import { relativePath } from '../utils/formatter';

export class SCSSCodeActionProvider implements vscode.CodeActionProvider {

    constructor(private serviceProvider: SymbolService) { }

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
        const actions = new Array<vscode.CodeAction>();
        const wordRange = document.getWordRangeAtPosition(range.start);
        const word = document.getText(wordRange);
        const symbols = this.serviceProvider.symbols.filter(x => x.variables.find(y => y.name === word));
        //TODO: Do not show action if import is already displayed on page
        if (symbols.length > 0) {
            symbols.forEach(symbol => {
                actions.push({
                    title: relativePath(document.uri.fsPath, symbol.filePath),
                    command: {
                        title: 'Trigger Auto import',
                        command: 'scss.toolkit.autoimport',
                        arguments: [document, symbol]
                    }
                });
            });
        }

        return actions;
    }
}
