import * as fs from 'fs';
import * as path from 'path';
import { ServiceProvider } from '../providers/service.provider';
import { isSupportedImport } from './validator';

export function formatError(message: string, err: any): string {
    if (err instanceof Error) {
        let error = <Error>err;
        return `${message}: ${error.message}\n${error.stack}`;
    } else if (typeof err === 'string') {
        return `${message}: ${err}`;
    } else if (err) {
        return `${message}: ${err.toString()}`;
    }
    return message;
}

export function formatSymbolImport(fromFilePath: string, toFilePath: string, isImportIncluded = true) {
    const pathSegments = relativePath(fromFilePath, toFilePath).split('\\');
    const fileName = pathSegments[pathSegments.length - 1];
    const isPartialImport = fileName[0] === '_';

    if (isPartialImport) {
        pathSegments[pathSegments.length - 1] = fileName.replace('_', '').replace('.scss', '');
    }

    const importString = isImportIncluded ? '@import ' : '';

    return `${importString} '${path.join(...pathSegments).replace(/\\/g, '/')}'`;
}

export function relativePath(from: string, to: string) {
    return path.relative(path.dirname(from), to);
}

export function fsPathForImport(fromFsPath: string, importTo: string) {
    if (isSupportedImport(importTo)) {
        let fsPathTo = trimImportCharacter(importTo);

        let absolutePathResult = path.resolve(path.dirname(fromFsPath), fsPathTo);

        if (absolutePathResult.indexOf('.scss') === -1) {
            absolutePathResult = `${absolutePathResult}.scss`;
        }

        if (!fs.existsSync(absolutePathResult)) {
            absolutePathResult = path.join(path.dirname(absolutePathResult), `_${path.basename(absolutePathResult)}`);
        }

        if (fs.existsSync(absolutePathResult)) {
            return absolutePathResult;
        } else {
            ServiceProvider.loggerService.loggWarning(`Import from '${fromFsPath}' with import rule '${importTo}' could not be resolved`);
        }
    } else {
        ServiceProvider.loggerService.loggWarning(`Import from '${fromFsPath}' with import rule '${importTo}' is not supported`);
    }
}

export function trimImportCharacter(importPath: string) {
    return importPath.replace('@import', '')
        .replace(';', '')
        .replace('"', '')
        .replace('"', '')
        .replace('\'', '')
        .replace('\'', '')
        .trim();
}

