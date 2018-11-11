// import * as path from 'path';
// import { InitializeParams, TextDocument } from 'vscode-languageserver';
// import { SymbolInformation, SymbolKind } from 'vscode-languageserver-types';
// import URI from 'vscode-uri';

// import { Workspace } from '../models/workspace';

// export class WorkspaceService {
//     public assignSymbols(filePath: string, content: string) {
//         if (content.length === 0) {
//             return;
//         }

//         Config.workspaces.forEach((workspace) => {
//             if (filePath.startsWith(workspace.path)) {
//                 const document = TextDocument.create(filePath, 'scss', 1, content);
//                 const stylesheet: any = Config.languageService.parseStylesheet(document);
//                 const symbols = Config.languageService.findDocumentSymbols(document, stylesheet);

//                 workspace.files.push({
//                     path: filePath,
//                     variables: symbols.filter(x => x.kind === SymbolKind.Variable)
//                 });
//             }
//         });

//     }
//     public createWorkspaces(param: InitializeParams): Workspace[] {
//         let workspaces: Workspace[];

//         if (Array.isArray(param.workspaceFolders)) {
//             workspaces = param.workspaceFolders.map(w => ({ name: w.name, files: [], path: URI.parse(w.uri).fsPath }));
//         } else {
//             workspaces = [];

//             if (param.rootPath) {
//                 workspaces.push({ name: '', files: [], path: param.rootPath });
//             }
//         }

//         return workspaces;
//     }

//     public get activeWorkspace() {
//         return Config.workspaces[0];
//     }

//     private getIncludedSymbols(symbols: SymbolInformation[]): any {
//         return symbols.filter(symbol => symbol.kind === SymbolKind.Variable);
//     }
// }