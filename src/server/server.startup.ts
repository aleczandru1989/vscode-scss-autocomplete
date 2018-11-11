// import * as fs from 'fs';
// import {
//     CompletionList,
//     createConnection,
//     InitializeParams,
//     InitializeResult,
//     ProposedFeatures,
//     ServerCapabilities,
//     TextDocuments,
// } from 'vscode-languageserver';

// import { SERVER_EVENT } from '../common/event';
// import { TriggerKind } from './models/trigger-kind';
// import { Config } from './server.config';
// import { runSafe } from '../client/utils/runner';

// const connection = createConnection(ProposedFeatures.all);
// const documents = new TextDocuments();

// documents.listen(connection);

// connection.onInitialize((params: InitializeParams): InitializeResult => {
//     Config.setup(connection, params);

//     const capabilities: ServerCapabilities = {
//         textDocumentSync: documents.syncKind,
//         completionProvider: { resolveProvider: true, triggerCharacters: [TriggerKind.$] }
//     };

//     return { capabilities };
// });

// connection.onCompletion((textDocumentPosition, token) => {
//     return runSafe(() => {
//         const document = documents.get(textDocumentPosition.textDocument.uri);
//         if (!document && !Config.workspaceService.activeWorkspace) {
//             return null;
//         }

//         const completion: CompletionList = {
//             isIncomplete: false,
//             items: Config.symbolService.getCompletionItems(document, textDocumentPosition)
//         };

//         return completion;
//     }, null, `Error while computing completions for ${textDocumentPosition.textDocument.uri}`, token);
// });

// connection.onNotification(SERVER_EVENT.WORKSPACE_FILE_URI, (paths: string[]) => {
//     paths.forEach(path => {
//         fs.readFile(path, (err, buffer) => {
//             if (err) {
//                 Config.loggerService.loggError(`Could not read file from path '${path}'`);
//             } else {
//                 Config.workspaceService.assignSymbols(path, buffer.toString());
//             }
//         });
//     });
// });

// connection.listen();
