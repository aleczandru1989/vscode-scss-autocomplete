import * as vscode from 'vscode';

export function getWord(document: vscode.TextDocument, position: vscode.Position) {
    const wordRange = document.getWordRangeAtPosition(position);

    return wordRange ? document.getText(wordRange) : '';
}