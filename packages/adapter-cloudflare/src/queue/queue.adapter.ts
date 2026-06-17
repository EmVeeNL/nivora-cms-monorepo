import type { QueueAdapter } from "@nivora-cms/core";

export class CloudflareQueueAdapter implements QueueAdapter {
	constructor(private readonly queue: Queue<unknown>) {}

	async enqueue<T>(
		_queue: string,
		payload: T,
		options?: { delaySeconds?: number },
	): Promise<void> {
		await this.queue.send(payload as unknown, {
			delaySeconds: options?.delaySeconds,
		});
	}
}
