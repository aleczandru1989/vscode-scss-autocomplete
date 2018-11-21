import * as path from 'path';
import * as vscode from 'vscode';
import { SymbolService } from '../services/symbol.service';
import { formatSymbolImport, fsPathForImport, relativePath } from '../utils/formatter';
import { getWord } from '../utils/text';
import { isExistingImport } from '../utils/validator';

export class SCSSCodeActionProvider implements vscode.CodeActionProvider {
    constructor(private symbolService: SymbolService) { }

    public provideCodeActions(activeDocument: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
        const actions = new Array<vscode.CodeAction>();
        const activeSymbol = this.symbolService.getSymbolByUri(activeDocument.uri);

        if (activeSymbol) {
            const word = getWord(activeSymbol.document, range.start);
            const symbolCaches = this.symbolService.getSymbolsByName(word);

            symbolCaches.forEach(importedSymbol => {
                const importPath = formatSymbolImport(activeDocument.uri.fsPath, importedSymbol.document.uri.fsPath);

                if (!isExistingImport(activeSymbol, importPath)) {
                    const pathToImport = relativePath(activeSymbol.document.uri.fsPath, fsPathForImport(activeSymbol.document.uri.fsPath, importPath));
                    const importMessage = `Add '${path.basename(pathToImport)}' from '${pathToImport}'`;

                    actions.push({
                        title: importMessage,
                        command: {
                            title: 'Trigger Auto import',
                            command: 'scss.toolkit.autoimport',
                            arguments: [activeSymbol, importedSymbol]
                        }
                    });
                }
            });
        }

        return actions;
    }
}
