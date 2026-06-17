import { Hono } from "hono";
import { revokeToken, verifyToken } from "../../services/token.service.ts";

interface Env {
	CACHE: KVNamespace;
}

export const revokeRoute = new Hono<{ Bindings: Env }>().post(
	"/",
	async (c) => {
		const body = await c.req.json<{ token: string }>();
		if (!body.token) return c.json({ error: "missing token" }, 400);

		const payload = await verifyToken(body.token, c.env.CACHE);
		if (!payload) return c.json({ error: "invalid_token" }, 401);

		await revokeToken(payload.jti, c.env.CACHE);
		return c.json({ revoked: true });
	},
);
