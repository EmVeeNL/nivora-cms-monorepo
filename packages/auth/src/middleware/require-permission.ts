import type { DrizzleD1Database } from "drizzle-orm/d1";
import { checkPermission } from "../services/acl.service.ts";

type Db = DrizzleD1Database<Record<string, unknown>>;

export class ForbiddenError extends Error {
	readonly status = 403;
	constructor(permission: string) {
		super(`Forbidden: missing permission '${permission}'`);
	}
}

export async function requirePermission(
	userId: string,
	permission: string,
	db: Db,
): Promise<void> {
	const allowed = await checkPermission(userId, permission, db);
	if (!allowed) throw new ForbiddenError(permission);
}
