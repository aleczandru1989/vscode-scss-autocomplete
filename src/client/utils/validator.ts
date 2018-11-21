import { SymbolCache } from '../models/document';
import { fsPathForImport, trimImportCharacters } from './formatter';

export function isSupportedImport(importValue: string) {
    const importPath = trimImportCharacters(importValue);

    const rules = {
        isMultiPartialImport: /^[\w\W]+,[\w\W]+$/.test(importPath),
        isCssImport: /^.+\.css$/.test(importPath),
        isHttpImport: /^(http|https):\/\/.+$/.test(importPath),
        isUrlImport: /^url\(.+[\);]$/.test(importPath)
    };

    let isValidImport = true;

    Object.keys(rules).forEach(key => isValidImport = isValidImport && !rules[key]);

    return isValidImport;
}

export function isExistingImport(activeSymbolCache: SymbolCache, scssImport: string) {
    const fsPathImport = fsPathForImport(activeSymbolCache.document.uri.fsPath, scssImport);

    const isExistingImportResult = activeSymbolCache.imports.find(
        x => fsPathForImport(activeSymbolCache.document.uri.fsPath, x.name) === fsPathImport) !== undefined;

    return isExistingImportResult;
}