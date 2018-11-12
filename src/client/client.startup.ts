import * as path from 'path';
import * as vscode from 'vscode';

import { SymbolCache } from './models/symbol';
import { SCSSCodeActionProvider } from './providers/code-action.provider';
import { SCSSCompletionItemProvider } from './providers/completion-item.provider';
import { ServiceProvider } from './providers/service.provider';

export async function activate() {
    await ServiceProvider.symbolService.scanForSymbols();

    vscode.commands.registerCommand('scss.toolkit.autoimport', triggerAutoImport);

    vscode.languages.registerCodeActionsProvider(['scss'], new SCSSCodeActionProvider());

    vscode.languages.registerCompletionItemProvider(['scss'], new SCSSCompletionItemProvider(ServiceProvider.symbolService));
}

function triggerAutoImport(document: vscode.TextDocument, symbol: SymbolCache) {
    const edit = new vscode.WorkspaceEdit();
    const currentDocumentSymbol = ServiceProvider.symbolService.symbols.find(x => x.filePath === document.uri.fsPath);
    const scssImport = `@import '${createRelativePath(document, symbol)}';\n`;
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


function createRelativePath(document: vscode.TextDocument, symbol: SymbolCache) {
    const relativePath = path.relative(document.uri.fsPath, symbol.filePath);
    const s = vscode.workspace.asRelativePath(symbol.filePath);
    //TODO: Fix relative path not imported correctly
    const pathSegments = relativePath.split('\\');
    const fileName = pathSegments[pathSegments.length - 1];
    const isPartialImport = fileName[0] === '_';

    if (isPartialImport) {
        pathSegments[pathSegments.length - 1] = fileName.replace('_', '').replace('.scss', '');
    }

    return path.join(...pathSegments).replace(/\\/g, '/');
}

