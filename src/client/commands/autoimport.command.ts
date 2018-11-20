import * as vscode from 'vscode';
import { SymbolCache } from '../models/document';
import { ServiceProvider } from '../providers/service.provider';
import { formatSymbolImport } from '../utils/formatter';

export function triggerAutoImport(document: vscode.TextDocument, symbolCache: SymbolCache) {
    const edit = new vscode.WorkspaceEdit();

    const scssImport = `${formatSymbolImport(document.uri.fsPath, symbolCache.document.uri.fsPath)};\n`;

    if (!isExistingImport(symbolCache, scssImport)) {
        edit.insert(document.uri, new vscode.Position(0, 0), scssImport);

        vscode.workspace.applyEdit(edit).then((isSuccessful) => {
            if (isSuccessful) {
                ServiceProvider.symbolService.update(document.uri);
            }
        });
    }
}

export function isExistingImport(symbolCache: SymbolCache, scssImport: string) {
    let isExistingImportResult = symbolCache.imports.find(
        x => x.name.trim().toLowerCase() === scssImport.trim().replace(';', '').toLowerCase()) !== undefined;

    for (const childSymbolCache of symbolCache.children) {
        if (isExistingImport(childSymbolCache, scssImport)) {
            isExistingImportResult = true;
            break;
        }
    }

    return isExistingImportResult;
}