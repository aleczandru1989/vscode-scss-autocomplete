import { InitializeParams, TextDocument } from 'vscode-languageserver';
import { SymbolInformation, SymbolKind } from 'vscode-languageserver-types';
import URI from 'vscode-uri';

import { Workspace } from '../models/workspace';
import { Config } from '../server.config';

export class WorkspaceService {
    public assignSymbols(filePath: string, content: string) {
        if (content.length === 0) {
            return;
        }

        Config.workspaces.forEach((workspace) => {
            if (!filePath.startsWith(workspace.path)) {
                return;
            }

            const document = TextDocument.create(filePath, 'scss', 1, content);
            const stylesheet: any = Config.languageService.parseStylesheet(document);
            const symbols = Config.languageService.findDocumentSymbols(document, stylesheet);

            workspace.symbols = workspace.symbols.concat(this.getIncludedSymbols(symbols));
        });

    }

    public createWorkspaces(param: InitializeParams): Workspace[] {
        let workspaces: Workspace[];

        if (Array.isArray(param.workspaceFolders)) {
            workspaces = param.workspaceFolders.map(w =>
                ({ name: w.name, symbols: [], path: URI.parse(w.uri).fsPath }));
        } else {
            workspaces = [];

            if (param.rootPath) {
                workspaces.push({ name: '', symbols: [], path: param.rootPath });
            }
        }

        return workspaces;
    }

    public get activeWorkspace() {
        return Config.workspaces[0];
    }

    private getIncludedSymbols(symbols: SymbolInformation[]): any {
        return symbols.filter(symbol => symbol.kind === SymbolKind.Variable);
    }
}