import * as path from 'path';

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

export function formatImport(fromFilePath: string, toFilePath: string) {
    const pathSegments = relativePath(fromFilePath, toFilePath).split('\\');
    const fileName = pathSegments[pathSegments.length - 1];
    const isPartialImport = fileName[0] === '_';

    if (isPartialImport) {
        pathSegments[pathSegments.length - 1] = fileName.replace('_', '');
    }

    return path.join(...pathSegments).replace(/\\/g, '/').replace('.scss', '');
}


export function relativePath(from: string, to: string) {
    return path.relative(path.dirname(from), to);
}

