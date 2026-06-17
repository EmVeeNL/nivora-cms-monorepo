import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { permissions } from "./permissions.entity.ts";
import { roles } from "./roles.entity.ts";

export const rolePermissions = sqliteTable(
	"role_permissions",
	{
		roleId: text("role_id")
			.notNull()
			.references(() => roles.id, { onDelete: "cascade" }),
		permissionId: text("permission_id")
			.notNull()
			.references(() => permissions.id, { onDelete: "cascade" }),
	},
	(t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);
