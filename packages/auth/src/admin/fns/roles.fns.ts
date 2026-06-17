import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import {
	permissions,
	rolePermissions,
	roles,
	userRoles,
} from "../../entities/index.ts";

type Db = DrizzleD1Database<Record<string, unknown>>;

export async function listRoles(db: Db) {
	return db.select().from(roles).orderBy(roles.name).all();
}

export async function createRole(
	data: { name: string; slug: string; description?: string },
	db: Db,
) {
	const id = crypto.randomUUID();
	await db.insert(roles).values({
		id,
		name: data.name,
		slug: data.slug,
		description: data.description,
		isSystem: false,
		createdAt: new Date(),
	});
	return { id };
}

export async function assignRoleToUser(userId: string, roleId: string, db: Db) {
	await db.insert(userRoles).values({ userId, roleId }).onConflictDoNothing();
}

export async function removeRoleFromUser(
	userId: string,
	roleId: string,
	db: Db,
) {
	await db
		.delete(userRoles)
		.where(eq(userRoles.userId, userId) && eq(userRoles.roleId, roleId));
}

export async function listPermissions(db: Db) {
	return db.select().from(permissions).orderBy(permissions.name).all();
}

export async function registerPermissions(
	pkg: string,
	names: string[],
	db: Db,
) {
	for (const name of names) {
		await db
			.insert(permissions)
			.values({
				id: crypto.randomUUID(),
				name,
				packageSlug: pkg,
				createdAt: new Date(),
			})
			.onConflictDoNothing();
	}
}

export async function grantPermission(
	roleId: string,
	permissionId: string,
	db: Db,
) {
	await db
		.insert(rolePermissions)
		.values({ roleId, permissionId })
		.onConflictDoNothing();
}

export async function revokePermission(
	roleId: string,
	permissionId: string,
	db: Db,
) {
	await db
		.delete(rolePermissions)
		.where(
			eq(rolePermissions.roleId, roleId) &&
				eq(rolePermissions.permissionId, permissionId),
		);
}
