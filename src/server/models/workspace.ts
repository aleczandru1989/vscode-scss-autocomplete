import { SymbolInformation } from 'vscode-languageserver-types';

export class Workspace {
    name: string;
    path: string;
    files: WorkspaceFile[] = [];
}

export class WorkspaceFile {
    path: string;
    variables: SymbolInformation[] = [];
}