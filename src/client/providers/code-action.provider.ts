import * as vscode from 'vscode';

import { SymbolService } from '../services/symbol.service';
import { formatImport, relativePath } from '../utils/formatter';

export class SCSSCodeActionProvider implements vscode.CodeActionProvider {

    constructor(private serviceProvider: SymbolService) { }

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
        const actions = new Array<vscode.CodeAction>();
        const wordRange = document.getWordRangeAtPosition(range.start);
        const word = document.getText(wordRange);
        const symbols = this.serviceProvider.symbols.filter(x => x.variables.find(y => y.name === word));
        const currentSymbol = this.serviceProvider.symbols.find(x => x.filePath === document.uri.fsPath);

        symbols.forEach(symbol => {
            const isExistingImport = currentSymbol.imports.find(x => x.name === formatImport(document.uri.fsPath, x.name));

            if (!isExistingImport) {
                actions.push({
                    title: relativePath(document.uri.fsPath, symbol.filePath),
                    command: {
                        title: 'Trigger Auto import',
                        command: 'scss.toolkit.autoimport',
                        arguments: [document, symbol]

                    }
                });
            }
        });

        return actions;
    }
}
