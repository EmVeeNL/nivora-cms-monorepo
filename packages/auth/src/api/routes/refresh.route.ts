import { Hono } from "hono";
import {
	issueToken,
	revokeToken,
	verifyToken,
} from "../../services/token.service.ts";

interface Env {
	CACHE: KVNamespace;
}

export const refreshRoute = new Hono<{ Bindings: Env }>().post(
	"/",
	async (c) => {
		const body = await c.req.json<{ refresh_token: string }>();
		if (!body.refresh_token)
			return c.json({ error: "missing refresh_token" }, 400);

		const payload = await verifyToken(body.refresh_token, c.env.CACHE);
		if (!payload) return c.json({ error: "invalid_token" }, 401);

		await revokeToken(payload.jti, c.env.CACHE);
		const token = await issueToken(
			{ sub: payload.sub, scope: payload.scope },
			c.env.CACHE,
		);

		return c.json({
			access_token: token,
			token_type: "Bearer",
			expires_in: 3600,
		});
	},
);
