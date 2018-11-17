import { trimImportCharacter } from './formatter';

export function isSupportedImport(importValue: string) {
    const importPath = trimImportCharacter(importValue);

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