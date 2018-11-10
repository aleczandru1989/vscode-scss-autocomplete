import * as path from 'path';
import { ExtensionContext, workspace } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
    client = new LanguageClient("scss.toolkit", 'SCSS Toolkit', createServerOptions(), createClientOptions());

    client.start();

    client.onReady().then(() => subscribeToClientEvents(context));
}

export function deactivate() {
    if (client) {
        client.stop();
    }
}

function subscribeToClientEvents(context: ExtensionContext) {
    //  context.subscriptions.push(languages.registerCompletionItemProvider(['scss'], new AutocompleteService()));

    // window.onDidChangeActiveTextEditor(() => {
    //     const editor = window.activeTextEditor;

    //     if (editor && editor.document.languageId === 'scss') {
    //         client.sendRequest('changeActiveDocument', editor.document);
    //     }
    // });
}

function createServerOptions() {
    const server = path.join(__dirname, '../server', 'server.startup.js');
    const serverOptions: ServerOptions = {
        run: {
            module: server,
            transport: TransportKind.ipc
        },
        debug: {
            module: server,
            transport: TransportKind.ipc,
            options: {
                execArgv: ['--nolazy', '--inspect=9229', '--inspect-brk']
            }
        }
    };

    return serverOptions;
}

function createClientOptions() {
    const clientOptions: LanguageClientOptions = {
        documentSelector: ['scss'],
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher('**/*.scss')
        },
        initializationOptions: {
            settings: workspace.getConfiguration('scss')
        }
    };

    return clientOptions;
}
