import * as vscode from 'vscode';
import { DocumentCache } from './models/document';
import { SCSSCodeActionProvider } from './providers/code-action.provider';
import { SCSSCompletionItemProvider } from './providers/completion-item.provider';
import { ServiceProvider } from './providers/service.provider';
import { formatSymbolImport } from './utils/formatter';


const disposables = new Array<vscode.Disposable>();
export async function activate() {
    await ServiceProvider.symbolService.createDocumentSymbolCache();

    disposables.push(vscode.commands.registerCommand('scss.toolkit.autoimport', triggerAutoImport));

    disposables.push(vscode.languages.registerCodeActionsProvider(['scss'], new SCSSCodeActionProvider(ServiceProvider.symbolService)));

    disposables.push(vscode.languages.registerCompletionItemProvider(['scss'], new SCSSCompletionItemProvider(ServiceProvider.symbolService)));

    disposables.push(vscode.languages.registerDocumentSymbolProvider(['scss'], new SCSSDocumentSymbolProvider()));
}

export function deactivate() {
    disposables.forEach(disposable => disposable.dispose());
}

export class SCSSDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
        throw new Error('Method not implemented.');
    }
}

function triggerAutoImport(document: vscode.TextDocument, cache: DocumentCache) {
    const edit = new vscode.WorkspaceEdit();
    const currentDocumentSymbol = ServiceProvider.symbolService.documentCache.find(x => x.document.uri.fsPath === document.uri.fsPath);
    const scssImport = `${formatSymbolImport(document.uri.fsPath, cache.document.uri.fsPath)};\n`;
    const isExistingImport = currentDocumentSymbol.imports.find(x =>
        x.name.trim().toLowerCase() === scssImport.trim().replace(';', '').toLowerCase());

    if (!isExistingImport) {
        edit.insert(document.uri, new vscode.Position(0, 0), scssImport);

        vscode.workspace.applyEdit(edit).then((isSuccessful) => {
            if (isSuccessful) {
                ServiceProvider.symbolService.updateCacheByUri(document.uri);
            }
        });
    }
}


