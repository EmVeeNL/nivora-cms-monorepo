import { definePackageConfig } from "@nivora-cms/core";

export default definePackageConfig({
	name: "Cloudflare Adapter",
	description: "Cloudflare D1, R2, KV, Queues, and Cron Triggers adapter",
	version: "0.1.0",

	routes: {
		admin: false,
		api: false,
	},
});
