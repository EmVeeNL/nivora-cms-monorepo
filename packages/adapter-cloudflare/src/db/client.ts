import type { DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle } from "drizzle-orm/d1";
import type { Env } from "../types.ts";
import * as schema from "./schema/index.ts";

export type Schema = typeof schema;
export type Database = DrizzleD1Database<Schema>;

export function createDb(env: Env): Database {
	return drizzle(env.DB, { schema });
}
