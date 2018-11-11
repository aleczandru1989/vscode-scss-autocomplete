
import { formatError } from '../utils/formatter';
import * as vscode from 'vscode';
import { Settings } from '../models/settings';

export class LoggerService {
    constructor(private settings: Settings) { }
    public loggError(message: string, error?: any) {
        const errorMessage = formatError(message, error);

        if (this.settings.log.error) {
            vscode.window.showErrorMessage(errorMessage);
        }

        console.error(errorMessage);
    }

    public loggWarning(message: string) {
        if (this.settings.log.warning) {
            vscode.window.showWarningMessage(message);
        }

        console.warn(message);
    }

    public loggInfo(message: string) {
        if (this.settings.log.info) {
            vscode.window.showInformationMessage(message);
        }

        console.log(message);
    }
}