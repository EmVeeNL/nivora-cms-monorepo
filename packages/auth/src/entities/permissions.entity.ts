import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const permissions = sqliteTable("permissions", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	description: text("description"),
	packageSlug: text("package_slug").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
