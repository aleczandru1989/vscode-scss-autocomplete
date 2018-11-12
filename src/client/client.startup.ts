import * as vscode from 'vscode';

import { SymbolCache } from './models/symbol';
import { SCSSCodeActionProvider } from './providers/code-action.provider';
import { SCSSCompletionItemProvider } from './providers/completion-item.provider';
import { ServiceProvider } from './providers/service.provider';
import { formatPathAsRelative } from './utils/formatter';

export async function activate() {
    await ServiceProvider.symbolService.scanForSymbols();

    vscode.commands.registerCommand('scss.toolkit.autoimport', triggerAutoImport);

    vscode.languages.registerCodeActionsProvider(['scss'], new SCSSCodeActionProvider(ServiceProvider.symbolService));

    vscode.languages.registerCompletionItemProvider(['scss'], new SCSSCompletionItemProvider(ServiceProvider.symbolService));
}

function triggerAutoImport(document: vscode.TextDocument, symbol: SymbolCache) {
    const edit = new vscode.WorkspaceEdit();
    const currentDocumentSymbol = ServiceProvider.symbolService.symbols.find(x => x.filePath === document.uri.fsPath);
    const scssImport = `@import '${formatPathAsRelative(document.uri.fsPath, symbol.filePath)}';\n`;
    const isExistingImport = currentDocumentSymbol.imports.find(x =>
        x.name.trim().toLowerCase() === scssImport.trim().replace(';', '').toLowerCase());

    if (!isExistingImport) {
        edit.insert(document.uri, new vscode.Position(0, 0), scssImport);

        vscode.workspace.applyEdit(edit).then((isSuccessful) => {
            if (isSuccessful) {
                ServiceProvider.symbolService.updateSymbolCache(document.uri);
            }
        });
    }
}


