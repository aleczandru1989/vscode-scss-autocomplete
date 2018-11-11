import { CancellationToken } from 'vscode';
import { ErrorCodes, ResponseError } from 'vscode-jsonrpc';
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