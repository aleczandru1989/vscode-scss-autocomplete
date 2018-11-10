import { CancellationToken } from 'vscode';
import { ErrorCodes, ResponseError } from 'vscode-jsonrpc';

import { Config } from '../server.config';


export function runSafe<T, E>(func: () => T, errorVal: T, errorMessage: string, token: CancellationToken): Thenable<T | ResponseError<E>> {
    return new Promise<T | ResponseError<E>>((resolve) => {
        setImmediate(() => {
            if (token.isCancellationRequested) {
                resolve(cancelValue());
            } else {
                try {
                    const result = func();
                    token.isCancellationRequested ? resolve(cancelValue()) : resolve(result);
                } catch (e) {
                    Config.loggerService.loggError(errorMessage, e);
                    resolve(errorVal);
                }
            }
        });
    });
}

function cancelValue<E>() {
    return new ResponseError<E>(ErrorCodes.RequestCancelled, 'Request cancelled');
}
