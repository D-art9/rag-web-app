/**
 * Stub implementation of a Cache library to satisfy structural dependencies.
 */
class MockCache {
    private storage = new Map<string, any>();

    get(key: string): any {
        return this.storage.get(key);
    }

    set(key: string, value: any, ttl?: number): void {
        this.storage.set(key, value);
    }

    delete(key: string): void {
        this.storage.delete(key);
    }

    clear(): void {
        this.storage.clear();
    }
}

class CacheService {
    private cache: MockCache;

    constructor() {
        this.cache = new MockCache();
    }

    public get(key: string): any {
        return this.cache.get(key);
    }

    public set(key: string, value: any, ttl: number): void {
        this.cache.set(key, value, ttl);
    }

    public delete(key: string): void {
        this.cache.delete(key);
    }

    public clear(): void {
        this.cache.clear();
    }
}

export default new CacheService();