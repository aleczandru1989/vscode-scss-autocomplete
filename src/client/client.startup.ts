import * as path from 'path';
import * as vscode from 'vscode';

import { SymbolCache } from './models/symbol';
import { SCSSCodeActionProvider } from './providers/code-action.provider';
import { SCSSCompletionItemProvider } from './providers/completion-item.provider';
import { ServiceProvider } from './providers/service.provider';
import { SymbolKind } from 'vscode';

export async function activate() {
    await ServiceProvider.symbolService.scanForSymbols();

    vscode.commands.registerCommand('scss.toolkit.autoimport', triggerAutoImport);

    vscode.languages.registerCodeActionsProvider(['scss'], new SCSSCodeActionProvider());

    vscode.languages.registerCompletionItemProvider(['scss'], new SCSSCompletionItemProvider(ServiceProvider.symbolService));
}

function triggerAutoImport(document: vscode.TextDocument, symbol: SymbolCache) {
    const edit = new vscode.WorkspaceEdit();
    const relativePath = path.relative(document.uri.fsPath, symbol.filePath).replace('/', `${'/\\'}`);
    const scssImport = `@import '${relativePath}';\n`;
    const isExistingImport = () => symbol.imports.find(x => x.name.trim().toLowerCase() === scssImport.trim().toLowerCase());

    if (!isExistingImport()) {
        edit.insert(document.uri, new vscode.Position(0, 0), scssImport);

        vscode.workspace.applyEdit(edit);

        symbol.imports.unshift(ServiceProvider.symbolService.createSymbolInformation(document, scssImport, SymbolKind.Namespace));
    }
}
