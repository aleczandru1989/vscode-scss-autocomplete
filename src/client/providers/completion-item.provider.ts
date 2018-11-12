import * as vscode from 'vscode';

import { TriggerKind } from '../models/trigger';
import { SymbolService } from '../services/symbol.service';
import { relativePath } from '../utils/formatter';
import { runSafe } from '../utils/runner';

export class SCSSCompletionItemProvider implements vscode.CompletionItemProvider {
    constructor(private symbolService: SymbolService) { }
    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        return runSafe(() => {
            if (!document) {
                return null;
            }

            const completion: vscode.CompletionList = {
                isIncomplete: false,
                items: this.getCompletionItems(document, position)
            };

            return completion;
        }, null, `Error while computing completions for ${document.uri}`, token);
    }

    private getCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
        const range = document.getWordRangeAtPosition(position);
        const word = range ? document.getText(range) : '';
        let completionItems: vscode.CompletionItem[];

        if (this.isVariableTrigger(word)) {
            completionItems = this.createVariables(document);
        }

        return completionItems;
    }

    private createVariables(document: vscode.TextDocument): vscode.CompletionItem[] {
        let items: vscode.CompletionItem[] = [];
        const symbols = this.symbolService.getByDocumentWorkspace(document);

        symbols.forEach(symbol => {
            items = items.concat(...symbol.variables.map(v => ({
                label: v.name,
                kind: vscode.CompletionItemKind.Variable,
                detail: relativePath(document.uri.fsPath, symbol.filePath),
                command: {
                    title: 'Trigger Auto import',
                    command: 'scss.toolkit.autoimport',
                    arguments: [document, symbol]
                }
            })));
        });

        return items;
    }

    private isVariableTrigger(word: string) {
        return word[0] === TriggerKind.$;
    }
}