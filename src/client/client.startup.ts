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

    const watcher = vscode.workspace.createFileSystemWatcher(ServiceProvider.settings.includePattern);
    disposables.push(watcher.onDidChange(fileChange));
    disposables.push(watcher.onDidCreate(fileCreate));
    disposables.push(watcher.onDidDelete(fileDelete));

    disposables.push(vscode.commands.registerCommand('scss.toolkit.autoimport', triggerAutoImport));

    disposables.push(vscode.languages.registerCodeActionsProvider(['scss'], new SCSSCodeActionProvider(ServiceProvider.symbolService)));

    disposables.push(vscode.languages.registerCompletionItemProvider(['scss'], new SCSSCompletionItemProvider(ServiceProvider.symbolService)));

    ServiceProvider.loggerService.loggInfo(`SCSS Toolkit has finished building cache at ${getTime()}`);
}

export function deactivate() {
    disposables.forEach(disposable => disposable.dispose());
}

function fileChange(uri: URI) {
    setTimeout(() => {
        console.log(uri.fsPath);
    }, 1500);
}

function fileCreate(uri: URI) {

}

function fileDelete(uri: URI) {

}

