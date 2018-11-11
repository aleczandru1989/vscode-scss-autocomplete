import * as vscode from 'vscode';

export class Settings {
    constructor() {
        Object.assign(this, vscode.workspace.getConfiguration('scss.toolkit'));
    }

    public log = {
        error: true,
        info: true,
        warning: true
    };
    public exclude = [];
    public include = [];
}