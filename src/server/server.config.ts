import { getSCSSLanguageService } from 'vscode-css-languageservice';
import { InitializeParams } from 'vscode-languageclient';
import { Connection } from 'vscode-languageserver';

import { Workspace } from './models/workspace';
import { LoggerService } from './services/logger.service';
import { SymbolService } from './services/symbol.service';
import { WorkspaceService } from './services/workspace.service';

export class Config {
    public static workspaces: Workspace[];
    public static loggerService: LoggerService;
    public static workspaceService: WorkspaceService;
    public static symbolService: SymbolService;
    public static languageService = getSCSSLanguageService();
    public static settings = {
        log: {
            error: true,
            info: true,
            warning: true
        },
        exclude: [],
        include: []
    };

    public static setup(connection: Connection, params: InitializeParams) {

        this.mergeSettings(params.initializationOptions);

        this.loggerService = new LoggerService(connection);

        this.workspaceService = new WorkspaceService();

        this.symbolService = new SymbolService(this.workspaceService, this.loggerService);

        this.workspaces = this.workspaceService.createWorkspaces(params);
    }

    private static mergeSettings(initializationOptions: any) {
        if (initializationOptions && initializationOptions.settings) {
            Object.assign(this.settings, initializationOptions.settings);
        }
    }
}