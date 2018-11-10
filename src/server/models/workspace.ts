import { SymbolInformation } from 'vscode-languageserver-types';

export interface Workspace {
    name: string;
    path: string;
    symbols: SymbolInformation[];
}

export interface WorkspaceFile {
    path: string;
}