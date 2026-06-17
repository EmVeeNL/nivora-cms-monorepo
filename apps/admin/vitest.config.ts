import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tailwindcss(), viteReact()],
	resolve: {
		alias: { "@": resolve(import.meta.dirname, "src") },
	},
	test: {
		environment: "jsdom",
		globals: true,
	},
});
