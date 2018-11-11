// import * as path from 'path';
// import { CompletionParams } from 'vscode-languageclient';
// import { CompletionItem, CompletionItemKind, Position, TextDocument } from 'vscode-languageserver-types';
// import URI from 'vscode-uri';

// import { TriggerKind } from '../models/trigger-kind';
// import { LoggerService } from '../../client/services/logger.service';
// import { WorkspaceService } from './workspace.service';

// export class AutocompleteService {
//     constructor(
//         private workspaceService: WorkspaceService,
//         private loggerService: LoggerService) { }

//     public getCompletionItems(document: TextDocument, param: CompletionParams): CompletionItem[] {
//         const currentDocPath = URI.parse(param.textDocument.uri).fsPath;
//         const word = this.getCurrentWord(document, param.position);
//         let completionItems: CompletionItem[];

//         if (this.isVariableTrigger(word)) {
//             completionItems = this.createVariables(currentDocPath);
//         }

//         return completionItems;
//     }

//     private isVariableTrigger(word: string) {
//         return TriggerKind.$ || word[0] === TriggerKind.$;
//     }

//     private createVariables(currentDocPath: string): CompletionItem[] {
//         const items: CompletionItem[] = [];

//         this.workspaceService.activeWorkspace.files.forEach(x => {
//             x.variables.forEach(variable => {
//                 const variablePath = path.relative(currentDocPath, x.path);
//                 items.push({
//                     label: variable.name,
//                     kind: CompletionItemKind.Variable,
//                     detail: variablePath,
//                     command: {
//                         title: 'Trigger Auto import',
//                         command: 'scss.toolkit.autoimport',
//                         arguments: [variablePath]
//                     }
//                 });
//             });
//         });

//         return items;
//     }

//     private getCurrentWord(document: TextDocument, position: Position) {
//         const offset = document.offsetAt(position);
//         let i = offset - 1;
//         let text = document.getText();
//         while (i >= 0 && ' \t\n\r":{[()]},*>+'.indexOf(text.charAt(i)) === -1) {
//             i--;
//         }
//         return text.substring(i + 1, offset);
//     }
// }