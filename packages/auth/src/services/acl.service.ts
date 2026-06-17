import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import {
	permissions,
	rolePermissions,
	roles,
	userRoles,
} from "../entities/index.ts";

type Db = DrizzleD1Database<Record<string, unknown>>;

export async function checkPermission(
	userId: string,
	permission: string,
	db: Db,
): Promise<boolean> {
	const result = await db
		.select({ name: permissions.name })
		.from(userRoles)
		.innerJoin(roles, eq(userRoles.roleId, roles.id))
		.innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
		.innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
		.where(eq(userRoles.userId, userId))
		.all();

	return result.some((r) => r.name === permission);
}

export async function getUserPermissions(
	userId: string,
	db: Db,
): Promise<string[]> {
	const result = await db
		.select({ name: permissions.name })
		.from(userRoles)
		.innerJoin(roles, eq(userRoles.roleId, roles.id))
		.innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
		.innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
		.where(eq(userRoles.userId, userId))
		.all();

	return [...new Set(result.map((r) => r.name))];
}

export async function getUserRoles(
	userId: string,
	db: Db,
): Promise<Array<{ id: string; slug: string; name: string }>> {
	return db
		.select({ id: roles.id, slug: roles.slug, name: roles.name })
		.from(userRoles)
		.innerJoin(roles, eq(userRoles.roleId, roles.id))
		.where(eq(userRoles.userId, userId))
		.all();
}
