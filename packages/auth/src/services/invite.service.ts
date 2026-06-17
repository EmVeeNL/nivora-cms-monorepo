import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Auth } from "../auth.ts";
import { users } from "../entities/index.ts";

type Db = DrizzleD1Database<Record<string, unknown>>;

export interface InviteOptions {
	email: string;
	name: string;
	invitedById: string;
	roleSlug?: string;
}

export async function createInvite(
	options: InviteOptions,
	auth: Auth,
	db: Db,
): Promise<{ token: string }> {
	const existing = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, options.email))
		.get();

	if (existing) throw new Error("User with this email already exists");

	await auth.api.sendVerificationEmail({
		body: { email: options.email, callbackURL: "/admin/accept-invite" },
	});

	// Token is delivered via email; return a success marker only.
	return { token: "" };
}

export async function acceptInvite(
	token: string,
	password: string,
	auth: Auth,
): Promise<void> {
	await auth.api.verifyEmail({ query: { token } });
	await auth.api.resetPassword({ body: { token, newPassword: password } });
}
