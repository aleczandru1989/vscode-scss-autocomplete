export const SETTINGS = {
    log: {
        error: true,
        info: true,
        warning: true
    }
}

export function mergeSettings(initializationOptions: any) {
    if (initializationOptions && initializationOptions.settings) {
        Object.assign(SETTINGS, initializationOptions.settings);
    }
}