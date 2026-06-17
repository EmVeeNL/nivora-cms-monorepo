import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { roles } from "./roles.entity.ts";
import { users } from "./users.entity.ts";

export const userRoles = sqliteTable(
	"user_roles",
	{
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		roleId: text("role_id")
			.notNull()
			.references(() => roles.id, { onDelete: "cascade" }),
	},
	(t) => [primaryKey({ columns: [t.userId, t.roleId] })],
);
