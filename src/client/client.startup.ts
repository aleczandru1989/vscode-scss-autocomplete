import * as vscode from 'vscode';
import URI from 'vscode-uri';
import { triggerAutoImport } from './commands/autoimport.command';
import { SCSSCodeActionProvider } from './providers/code-action.provider';
import { SCSSCompletionItemProvider } from './providers/completion-item.provider';
import { ServiceProvider } from './providers/service.provider';
import { getTime } from './utils/time';

const disposables = new Array<vscode.Disposable>();
export async function activate() {
    ServiceProvider.loggerService.loggInfo(`SCSS Toolkit has started building cache at ${getTime()}`);

    await ServiceProvider.symbolService.createDocumentSymbolCache();

    disposables.push(vscode.commands.registerCommand('scss.toolkit.autoimport', triggerAutoImport));

    disposables.push(vscode.languages.registerCodeActionsProvider(['scss'], new SCSSCodeActionProvider(ServiceProvider.symbolService)));

    disposables.push(vscode.languages.registerCompletionItemProvider(['scss'], new SCSSCompletionItemProvider(ServiceProvider.symbolService)));

    disposables.push(vscode.workspace.onDidChangeTextDocument((change) => fileChange(change.document.uri)));

    const watcher = vscode.workspace.createFileSystemWatcher(ServiceProvider.settings.includePattern);
    disposables.push(watcher.onDidChange(fileChange));
    disposables.push(watcher.onDidCreate(fileCreate));
    disposables.push(watcher.onDidDelete(fileDelete));
    disposables.push(watcher);

    ServiceProvider.loggerService.loggInfo(`SCSS Toolkit has finished building cache at ${getTime()}`);
}

export function deactivate() {
    disposables.forEach(disposable => disposable.dispose());
}

function fileChange(uri: URI) {
    ServiceProvider.symbolService.update(uri);
}

function fileCreate(uri: URI) {
    ServiceProvider.symbolService.create(uri);
}

function fileDelete(uri: URI) {
    ServiceProvider.symbolService.delete(uri);
}

