import * as fs from 'fs';
import { CancellationToken } from 'vscode';

import { ServiceProvider } from '../providers/service.provider';

export function runSafe<T>(func: () => T, errorVal: T, errorMessage: string, token: CancellationToken): Thenable<T> {
    return new Promise<T>((resolve) => {
        setImmediate(() => {
            if (token.isCancellationRequested) {
                resolve();
            } else {
                try {
                    const result = func();
                    token.isCancellationRequested ? resolve() : resolve(result);
                } catch (e) {
                    ServiceProvider.loggerService.loggError(errorMessage, e);
                    resolve(errorVal);
                }
            }
        });
    });
}

export function triggerReadFile<T>(func: (content: string) => void, path: string, promiseResolver?: any) {
    fs.readFile(path, (err, buffer) => {
        if (err) {
            ServiceProvider.loggerService.loggError(`Could not read file from path '${path}'`, err);

        } else {
            func(buffer.toString());
        }

        if (promiseResolver) {
            promiseResolver();
        }
    });
}