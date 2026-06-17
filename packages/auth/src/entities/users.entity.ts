import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" })
		.notNull()
		.default(false),
	image: text("image"),
	// Extended fields
	avatar: text("avatar"),
	locale: text("locale").notNull().default("en"),
	lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
	invitedBy: text("invited_by"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
