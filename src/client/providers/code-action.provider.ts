import * as path from 'path';
import * as vscode from 'vscode';
import { SymbolService } from '../services/symbol.service';
import { formatSymbolImport } from '../utils/formatter';
import { getWord } from '../utils/text';
import { isExistingImport } from './../commands/autoimport.command';

export class SCSSCodeActionProvider implements vscode.CodeActionProvider {
    constructor(private symbolService: SymbolService) { }

    provideCodeActions(activeDocument: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
        const actions = new Array<vscode.CodeAction>();

        const activeSymbol = this.symbolService.getSymbolByUri(activeDocument.uri);

        if (activeSymbol) {
            const word = getWord(activeDocument, range.start);

            const symbolCaches = this.symbolService.getSymbolsByWorkspace(activeDocument)
                .filter(x => x.variables.find(y => y.name === word));

            symbolCaches.forEach(importedSymbolCache => {
                const importPath = formatSymbolImport(activeDocument.uri.fsPath, importedSymbolCache.document.uri.fsPath);

                if (!isExistingImport(activeSymbol, importPath)) {
                    const pathToImport = importPath.replace('@import', '');
                    const importMessage = `Add '${path.basename(importedSymbolCache.document.uri.fsPath)}' from '${pathToImport}'`;

                    actions.push({
                        title: importMessage,
                        command: {
                            title: 'Trigger Auto import',
                            command: 'scss.toolkit.autoimport',
                            arguments: [activeSymbol, importedSymbolCache]
                        }
                    });
                }
            });
        }

        return actions;
    }
}
