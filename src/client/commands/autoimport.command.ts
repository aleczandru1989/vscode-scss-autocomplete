import * as vscode from 'vscode';
import { SymbolCache } from '../models/document';
import { ServiceProvider } from '../providers/service.provider';
import { formatSymbolImport } from '../utils/formatter';
import { isExistingImport } from '../utils/validator';

export function triggerAutoImport(activeSymbolCache: SymbolCache, importedSymbolCache: SymbolCache) {
    const scssImport = `${formatSymbolImport(activeSymbolCache.document.uri.fsPath, importedSymbolCache.document.uri.fsPath)};\n`;

    if (!isExistingImport(activeSymbolCache, scssImport)) {
        const edit = new vscode.WorkspaceEdit();

        edit.insert(activeSymbolCache.document.uri, new vscode.Position(0, 0), scssImport);

        vscode.workspace.applyEdit(edit)
            .then((isSuccessful) => {
                if (isSuccessful) {
                    ServiceProvider.symbolService.update(activeSymbolCache.document.uri);
                }
            });
    }
}

