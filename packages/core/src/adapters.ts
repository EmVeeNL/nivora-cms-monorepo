export interface PlatformConfig {
	featureFlags?: Record<string, boolean>
}

export interface StorageAdapter {
	upload(
		key: string,
		data: ReadableStream | ArrayBuffer | Blob,
		options?: { contentType?: string; metadata?: Record<string, string> },
	): Promise<void>
	delete(key: string): Promise<void>
	/** Public URL — synchronous; assumes CDN base URL is configured upfront */
	url(key: string): string
	exists(key: string): Promise<boolean>
	list(prefix?: string): Promise<string[]>
	getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>
}

export interface QueueAdapter {
	enqueue<T>(
		queue: string,
		payload: T,
		options?: { delaySeconds?: number },
	): Promise<void>
}

export interface CronAdapter {
	/** Register a handler for a cron pattern configured in wrangler.jsonc */
	register(schedule: string, handler: () => Promise<void>): void
	/** Dispatch an incoming scheduled event to the matching registered handler */
	dispatch(event: { scheduledTime: number; cron: string }): Promise<void>
}

export interface CacheAdapter {
	get<T>(key: string): Promise<T | null>
	set<T>(key: string, value: T, options?: { ttl?: number }): Promise<void>
	delete(key: string): Promise<void>
	has(key: string): Promise<boolean>
}

/** Opaque wrapper — concrete Drizzle type provided by adapter-cloudflare */
export interface DatabaseAdapter<TDb = unknown> {
	readonly db: TDb
}
