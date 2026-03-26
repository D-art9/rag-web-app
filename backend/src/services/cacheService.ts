/**
 * In-memory cache with real TTL support.
 * Entries expire after the specified TTL (in seconds).
 */
interface CacheEntry {
    value: any;
    expiresAt: number | null; // null = no expiry
}

class CacheService {
    private storage = new Map<string, CacheEntry>();

    public get(key: string): any {
        const entry = this.storage.get(key);
        if (!entry) return undefined;

        // FIX: Actually check TTL and evict expired entries
        if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
            this.storage.delete(key);
            return undefined;
        }

        return entry.value;
    }

    public set(key: string, value: any, ttl?: number): void {
        // FIX: TTL is now honoured — convert seconds to ms timestamp
        const expiresAt = ttl ? Date.now() + ttl * 1000 : null;
        this.storage.set(key, { value, expiresAt });
    }

    public delete(key: string): void {
        this.storage.delete(key);
    }

    public clear(): void {
        this.storage.clear();
    }

    /** Manually evict all expired entries (useful to call periodically) */
    public evictExpired(): void {
        const now = Date.now();
        for (const [key, entry] of this.storage.entries()) {
            if (entry.expiresAt !== null && now > entry.expiresAt) {
                this.storage.delete(key);
            }
        }
    }
}

export default new CacheService();