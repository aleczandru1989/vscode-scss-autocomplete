import {
    CompletionList,
    createConnection,
    InitializeParams,
    InitializeResult,
    ProposedFeatures,
    ServerCapabilities,
} from 'vscode-languageserver';

import { formatError } from '../utils/formatter.util';
import { ServiceProvider } from './config/service.config';
import { mergeSettings } from './config/settings.config';

ServiceProvider.connection = createConnection(ProposedFeatures.all);

ServiceProvider.documents.listen(ServiceProvider.connection);

process.on('unhandledRejection', (e: any) => {
    ServiceProvider.connection.console.error(formatError(`Unhandled exception`, e));
});

ServiceProvider.connection.onInitialize((params: InitializeParams): InitializeResult => {
    mergeSettings(params.initializationOptions);

    const capabilities: ServerCapabilities = {
        textDocumentSync: ServiceProvider.documents.syncKind,
        completionProvider: { resolveProvider: true, triggerCharacters: ['$'] }
    };

    return { capabilities }
});

// ServiceProvider.connection.onRequest('changeActiveDocument', (data: any) => {
//     readFile(data.fileName, (err, buffer) => {
//         const document = TextDocument.create(data.fileName, 'scss', 1, buffer.toString());
//         const stylesheet = ServiceProvider.scss.parseStylesheet(document);
//         const symbol = ServiceProvider.scss.findDocumentSymbols(document, stylesheet);
//         console.log('Spartan');
//     });
// });

ServiceProvider.connection.onCompletion((textDocumentPosition, token) => {
    console.log(textDocumentPosition);
    console.log(token);
    return new Promise((resolve, reject) => {
        const completion: CompletionList = {
            isIncomplete: false,
            items: [
                {

                    label: '$color:red'
                }
            ]
        };
        return resolve(completion);
    });
});

ServiceProvider.connection.listen();
