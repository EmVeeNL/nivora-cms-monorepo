import type { CacheAdapter } from "@nivora-cms/core";

export class KVCacheAdapter implements CacheAdapter {
	constructor(private readonly kv: KVNamespace) {}

	async get<T>(key: string): Promise<T | null> {
		return this.kv.get<T>(key, "json");
	}

	async set<T>(
		key: string,
		value: T,
		options?: { ttl?: number },
	): Promise<void> {
		await this.kv.put(key, JSON.stringify(value), {
			expirationTtl: options?.ttl,
		});
	}

	async delete(key: string): Promise<void> {
		await this.kv.delete(key);
	}

	async has(key: string): Promise<boolean> {
		const value = await this.kv.get(key);
		return value !== null;
	}
}
