import { definePackageConfig } from "@nivora-cms/core";

export default definePackageConfig({
	name: "i18n",
	description: "User-preference locale and message compilation via Paraglide JS",
	version: "0.1.0",

	routes: {
		admin: false,
		api: false,
	},

	settings: {
		defaultLocale: {
			type: "string",
			input: "select",
			default: "en",
			options: [
				{ label: "English", value: "en" },
				{ label: "Nederlands", value: "nl" },
			],
			label: "Default locale",
			description: "Used when a user has not set a locale preference",
		},
		fallbackLocale: {
			type: "string",
			input: "select",
			default: "en",
			options: [{ label: "English", value: "en" }],
			label: "Fallback locale",
			description: "Used when a message is missing in the selected locale",
		},
	},
});
