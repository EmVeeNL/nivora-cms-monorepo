import { Hono } from "hono";
import { jwtOrApiKeyMiddleware } from "../../middleware/jwt-or-api-key.ts";

interface Env {
	CACHE: KVNamespace;
}

export const meRoute = new Hono<{ Bindings: Env }>()
	.use(jwtOrApiKeyMiddleware)
	.get("/", (c) => {
		const payload = c.var.jwtPayload;
		return c.json({ sub: payload.sub, scope: payload.scope });
	});
