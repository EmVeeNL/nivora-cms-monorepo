import type { CronAdapter } from "@nivora-cms/core";

export class CloudflareCronAdapter implements CronAdapter {
	private readonly handlers = new Map<string, () => Promise<void>>();

	register(schedule: string, handler: () => Promise<void>): void {
		this.handlers.set(schedule, handler);
	}

	async dispatch(event: {
		scheduledTime: number;
		cron: string;
	}): Promise<void> {
		const handler = this.handlers.get(event.cron);
		if (handler) {
			await handler();
		}
	}
}
