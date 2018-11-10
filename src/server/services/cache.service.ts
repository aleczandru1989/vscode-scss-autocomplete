
export class CacheService {
    private FILE_CACHE: any = {}

    public hasKey(path: string) {
        return this.FILE_CACHE[path] !== undefined;
    }

    public create(path: string) {
        if (!this.hasKey(path)) {
            this.FILE_CACHE[path] = null;
        }
    }

    public get(path: string) {
        return this.FILE_CACHE[path];
    }
}
