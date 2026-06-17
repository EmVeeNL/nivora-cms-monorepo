import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Auth } from "../../auth.ts";
import {
	createInvite,
	type InviteOptions,
} from "../../services/invite.service.ts";

type Db = DrizzleD1Database<Record<string, unknown>>;

export async function inviteUser(options: InviteOptions, auth: Auth, db: Db) {
	return createInvite(options, auth, db);
}
