import type { StorageAdapter } from "@nivora-cms/core";

export class R2StorageAdapter implements StorageAdapter {
	constructor(
		private readonly bucket: R2Bucket,
		private readonly baseUrl: string = "/assets",
	) {}

	async upload(
		key: string,
		data: ReadableStream | ArrayBuffer | Blob,
		options?: { contentType?: string; metadata?: Record<string, string> },
	): Promise<void> {
		await this.bucket.put(key, data, {
			httpMetadata: options?.contentType
				? { contentType: options.contentType }
				: undefined,
			customMetadata: options?.metadata,
		});
	}

	async delete(key: string): Promise<void> {
		await this.bucket.delete(key);
	}

	url(key: string): string {
		return `${this.baseUrl}/${key}`;
	}

	async exists(key: string): Promise<boolean> {
		const head = await this.bucket.head(key);
		return head !== null;
	}

	async list(prefix?: string): Promise<string[]> {
		const result = await this.bucket.list(prefix ? { prefix } : undefined);
		return result.objects.map((obj) => obj.key);
	}

	async getSignedUrl(key: string, _expiresInSeconds = 3600): Promise<string> {
		// R2 does not natively support presigned URLs in the Workers runtime.
		// Return the public URL — deployments requiring private access should
		// route through a signed-token Worker endpoint instead.
		return this.url(key);
	}
}
