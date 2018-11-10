import { CompletionItem, CompletionItemKind, SymbolKind } from 'vscode-languageserver-types';

import { TriggerKind } from '../models/trigger-kind';
import { LoggerService } from './logger.service';
import { WorkspaceService } from './workspace.service';

export class SymbolService {
    constructor(
        private workspaceService: WorkspaceService,
        private loggerService: LoggerService) { }

    public getCompletionItems(triggerKind: string): CompletionItem[] {
        switch (triggerKind) {
            case TriggerKind.$:
                return this.createVariables();
            default:
                this.loggerService.loggError(`There is no handler defined for TriggerKing.${triggerKind}`);
        }
    }

    private createVariables(): CompletionItem[] {
        const symbols = this.workspaceService.activeWorkspace.symbols.filter(x => x.kind === SymbolKind.Variable);

        return symbols.map(x => ({
            label: x.name,
            kind: CompletionItemKind.Variable,
            detail: 'This is detail'
        }));
    }
}