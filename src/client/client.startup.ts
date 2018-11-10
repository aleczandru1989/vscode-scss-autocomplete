import * as path from 'path';
import { Uri, workspace } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';

import { SERVER_EVENT } from '../common/event';

let client: LanguageClient;

export function activate() {
    client = new LanguageClient('scss.toolkit', 'SCSS Toolkit', createServerOptions(), createClientOptions());

    client.start();

    client.onReady().then(() => {
        workspace.findFiles('**/*.scss', null, 99999)
            .then((uris: Uri[]) =>
                client.sendNotification(SERVER_EVENT.WORKSPACE_FILE_URI, [uris.map(uri => uri.fsPath)]));
    });
}

export function deactivate() {
    if (client) {
        client.stop();
    }
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
                execArgv: ['--nolazy', '--inspect=9229']
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
