import { Connection } from 'vscode-languageserver';

import { Config } from '../server.config';
import { formatError } from '../utils/formatter';

export class LoggerService {
    constructor(private connection: Connection) {
    }

    public loggError(message: string, error?: any) {
        const errorMessage = formatError(message, error);

        if (Config.settings.log.error) {
            this.connection.window.showErrorMessage(errorMessage);
        }

        console.error(errorMessage);
    }

    public loggWarning(message: string) {
        if (Config.settings.log.warning) {
            this.connection.window.showWarningMessage(message);
        }

        console.warn(message);
    }

    public loggInfo(message: string) {
        if (Config.settings.log.info) {
            this.connection.window.showInformationMessage(message);
        }

        console.log(message);
    }
}