import { getLESSLanguageService } from 'vscode-css-languageservice';
import { Connection, TextDocuments } from 'vscode-languageserver';

import { CacheService } from '../services/cache.service';
import { LoggerService } from '../services/logger.service';
import { SymbolService } from '../services/symbol.service';

export class ServiceProvider {
    public static connection: Connection;
    public static documents = new TextDocuments();
    private static loggerService: LoggerService;
    private static cacheService = new CacheService();
    private static symbolService = new SymbolService();
    private static scssLanguageService = getLESSLanguageService();

    public static get logger() {
        if (!this.loggerService) {
            this.loggerService = new LoggerService(this.connection);
        }

        return this.loggerService;
    }

    public static get cache() {
        return this.cacheService;
    }

    public static get symbol() {
        return this.symbolService;
    }

    public static get scss() {
        return this.scssLanguageService;
    }
}