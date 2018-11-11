// import { getSCSSLanguageService } from 'vscode-css-languageservice';
// import { InitializeParams } from 'vscode-languageclient';
// import { Connection } from 'vscode-languageserver';

// import { Workspace } from './models/workspace';
// import { AutocompleteService } from './services/autocomplete.service';
// import { LoggerService } from '../client/services/logger.service';
// import { WorkspaceService } from './services/workspace.service';

// export class Config {
//     public static workspaces: Workspace[];
//     public static loggerService: LoggerService;
//     public static workspaceService: WorkspaceService;
//     public static symbolService: AutocompleteService;
//     public static languageService = getSCSSLanguageService();
//     public static settings = {
//         log: {
//             error: true,
//             info: true,
//             warning: true
//         },
//         exclude: [],
//         include: []
//     };

//     public static setup(connection: Connection, params: InitializeParams) {

//         this.mergeSettings(params.initializationOptions);

//         this.loggerService = new LoggerService();

//         this.workspaceService = new WorkspaceService();

//         this.symbolService = new AutocompleteService(this.workspaceService, this.loggerService);

//         this.workspaces = this.workspaceService.createWorkspaces(params);
//     }

//     private static mergeSettings(initializationOptions: any) {
//         if (initializationOptions && initializationOptions.settings) {
//             Object.assign(this.settings, initializationOptions.settings);
//         }
//     }
// }