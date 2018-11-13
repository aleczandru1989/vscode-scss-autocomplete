import { WorkspaceFolder } from 'vscode';
import { SymbolInformation } from 'vscode-languageserver-types';


export class DocumentCache {
    workspace: WorkspaceFolder;
    fsPath: string;
    imports: SymbolInformation[] = [];
    variables: SymbolInformation[] = [];
}