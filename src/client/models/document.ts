import * as vscode from 'vscode';
import { WorkspaceFolder } from 'vscode';
import { StyleSheet } from './stylesheet';


export class SymbolCache {
    constructor(document: vscode.TextDocument, stylesheet: StyleSheet, workspace: vscode.WorkspaceFolder) {
        this.document = document;
        this.stylesheet = stylesheet;
        this.workspace = workspace;
    }
    isPublic: boolean;
    children: SymbolCache[] = [];
    workspace: WorkspaceFolder;
    document: vscode.TextDocument;
    stylesheet: StyleSheet;
    imports: SymbolImport[] = [];
    variables: vscode.SymbolInformation[] = [];
}

export class SymbolImport extends vscode.SymbolInformation {
    fsPath?: string;
    isPublic: boolean;
}
