import * as vscode from 'vscode';
import { WorkspaceFolder } from 'vscode';
import { StyleSheet } from './stylesheet';


export class DocumentCache {
    constructor(document: vscode.TextDocument, stylesheet: StyleSheet, workspace: vscode.WorkspaceFolder) {
        this.document = document;
        this.stylesheet = stylesheet;
        this.workspace = workspace;
    }

    workspace: WorkspaceFolder;
    document: vscode.TextDocument;
    stylesheet: StyleSheet;
    imports: SymbolCacheImport[] = [];
    variables: vscode.SymbolInformation[] = [];
}

export class SymbolCacheImport extends vscode.SymbolInformation {
    fsDocPath: string;
}
