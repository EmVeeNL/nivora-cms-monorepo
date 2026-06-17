import { definePackageConfig } from "@nivora-cms/core";

export default definePackageConfig({
	name: "UI",
	description: "Design system — Tailwind v4, shadcn/ui, Tabler icons, component library",
	version: "0.1.0",

	routes: {
		admin: false,
		api: false,
	},

	settings: {
		defaultTheme: {
			type: "string",
			input: "radio",
			default: "system",
			options: [
				{ label: "Light", value: "light" },
				{ label: "Dark", value: "dark" },
				{ label: "System", value: "system" },
			],
			label: "Default theme",
			description: "Initial theme before the user sets a preference",
		},
		accentColor: {
			type: "string",
			input: "color",
			default: "#3b82f6",
			label: "Accent color",
			description: "Primary brand color used for active states and CTAs",
		},
	},
});
