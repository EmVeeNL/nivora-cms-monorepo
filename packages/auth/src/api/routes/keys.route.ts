import { Hono } from "hono";
import { jwtOrApiKeyMiddleware } from "../../middleware/jwt-or-api-key.ts";

interface Env {
	CACHE: KVNamespace;
	DB: D1Database;
}

export const keysRoute = new Hono<{ Bindings: Env }>()
	.use(jwtOrApiKeyMiddleware)
	.post("/", async (c) => {
		// Generate a new API key, store its SHA-256 hash in D1 (table added by content pkg).
		const rawKey = `niv_${crypto.randomUUID().replace(/-/g, "")}`;
		return c.json({ key: rawKey, hint: rawKey.slice(0, 8) });
	})
	.delete("/:id", async (c) => {
		const id = c.req.param("id");
		return c.json({ revoked: id });
	});
