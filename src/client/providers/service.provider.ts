import { Settings } from '../models/settings';
import { LoggerService } from '../services/logger.service';
import { SymbolService } from '../services/symbol.service';

export class ServiceProvider {

    public static settings = new Settings();
    public static loggerService: LoggerService = new LoggerService(ServiceProvider.settings);
    public static symbolService: SymbolService = new SymbolService(ServiceProvider.loggerService);
}