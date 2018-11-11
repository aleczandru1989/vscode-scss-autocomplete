import { WorkspaceFolder } from 'vscode';
import { SymbolInformation } from 'vscode-languageserver-types';


export class SymbolCache {
    workspace: WorkspaceFolder;
    filePath: string;
    imports: SymbolInformation[] = [];
    variables: SymbolInformation[] = [];
}