import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as authSchema from "./entities/index.ts";

export interface AuthConfig {
	baseURL: string;
	secret: string;
}

export function createAuth(
	db: DrizzleD1Database<Record<string, unknown>>,
	config: AuthConfig,
) {
	return betterAuth({
		baseURL: config.baseURL,
		secret: config.secret,
		database: drizzleAdapter(db, {
			provider: "sqlite",
			schema: {
				users: authSchema.users,
				sessions: authSchema.sessions,
				accounts: authSchema.accounts,
				verifications: authSchema.verifications,
			},
			usePlural: true,
		}),
		plugins: [tanstackStartCookies()],
		user: {
			additionalFields: {
				avatar: { type: "string", required: false },
				locale: { type: "string", required: false, defaultValue: "en" },
				lastLoginAt: { type: "date", required: false },
				isActive: { type: "boolean", required: false, defaultValue: true },
				invitedBy: { type: "string", required: false },
			},
		},
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		account: {
			accountLinking: { enabled: false },
		},
	});
}

export type Auth = ReturnType<typeof createAuth>;
