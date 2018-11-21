import * as vscode from 'vscode';
import { SymbolCache } from '../models/document';
import { TriggerKind } from '../models/trigger';
import { SymbolService } from '../services/symbol.service';
import { relativePath } from '../utils/formatter';
import { runSafe } from '../utils/runner';
import { getWord } from '../utils/text';

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
        const activeSymbol = this.symbolService.getSymbolByUri(document.uri);
        let completionItems: vscode.CompletionItem[];

        if (activeSymbol) {
            const word = getWord(document, position);

            if (this.isVariableTrigger(word)) {
                completionItems = this.createVariables(activeSymbol);
            }
        }

        return completionItems;
    }

    private createVariables(activeSymbol: SymbolCache): vscode.CompletionItem[] {
        let items: vscode.CompletionItem[] = [];

        const symbolCaches = this.symbolService.getSymbolsByWorkspace(activeSymbol.document);

        symbolCaches.forEach(symbolCache => {
            items = items.concat(...symbolCache.variables.map(v => ({
                label: v.name,
                kind: vscode.CompletionItemKind.Variable,
                detail: v.value,
                documentation: relativePath(activeSymbol.document.uri.fsPath, symbolCache.document.uri.fsPath),
                command: {
                    title: 'Trigger Auto import',
                    command: 'scss.toolkit.autoimport',
                    arguments: [activeSymbol, symbolCache]
                }
            })));
        });

        return items;
    }

    private isVariableTrigger(word: string) {
        return word[0] === TriggerKind.$;
    }
}