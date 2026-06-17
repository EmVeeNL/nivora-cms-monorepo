import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { users } from "../../entities/index.ts";

type Db = DrizzleD1Database<Record<string, unknown>>;

export async function listUsers(db: Db) {
	return db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			locale: users.locale,
			isActive: users.isActive,
			lastLoginAt: users.lastLoginAt,
			createdAt: users.createdAt,
		})
		.from(users)
		.orderBy(users.createdAt)
		.all();
}

export async function getUserById(id: string, db: Db) {
	return db.select().from(users).where(eq(users.id, id)).get();
}

export async function deactivateUser(id: string, db: Db) {
	await db.update(users).set({ isActive: false }).where(eq(users.id, id));
}

export async function updateUserLocale(id: string, locale: string, db: Db) {
	await db.update(users).set({ locale }).where(eq(users.id, id));
}
