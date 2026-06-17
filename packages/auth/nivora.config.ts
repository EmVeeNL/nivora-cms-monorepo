import { definePackageConfig } from "@nivora-cms/core";

export default definePackageConfig({
	name: "Auth",
	description: "Admin session auth (better-auth), ACL, and OAuth2/JWT for API consumers",
	version: "0.1.0",

	routes: {
		admin: true,
		api: true,
	},

	permissions: [
		"auth.users.read",
		"auth.users.invite",
		"auth.users.deactivate",
		"auth.roles.read",
		"auth.roles.write",
		"auth.apikeys.read",
		"auth.apikeys.write",
	],

	navigation: [
		{
			label: "Users",
			icon: "users",
			route: "/admin/users",
			group: "system",
			order: 90,
			permission: "auth.users.read",
		},
		{
			label: "Roles",
			icon: "shield",
			route: "/admin/roles",
			group: "system",
			order: 91,
			permission: "auth.roles.read",
		},
	],

	db: {
		migrations: "./migrations",
		tables: ["users", "sessions", "accounts", "verifications", "roles", "permissions", "role_permissions", "user_roles"],
	},
});
