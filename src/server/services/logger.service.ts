import { Connection } from "vscode-languageserver";
import { SETTINGS } from "../config/settings.config";

export class LoggerService {
    constructor(private connection: Connection) {
    }

    public loggError(message: string) {
        if (SETTINGS.log.error) {
            this.connection.window.showErrorMessage(message);
            console.error(message);
        }
    }

    public loggWarning(message: string) {
        if (SETTINGS.log.warning) {
            this.connection.window.showWarningMessage(message);
            console.warn(message);
        }
    }

    public loggInfo(message: string) {
        if (SETTINGS.log.info) {
            this.connection.window.showInformationMessage(message);
            console.log(message);
        }
    }
}