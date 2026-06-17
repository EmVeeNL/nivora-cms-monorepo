import { Hono } from "hono";
import { issueToken } from "../../services/token.service.ts";

interface Env {
	CACHE: KVNamespace;
}

export const tokenRoute = new Hono<{ Bindings: Env }>().post("/", async (c) => {
	const body = await c.req.json<{
		grant_type: string;
		client_id?: string;
		scope?: string;
	}>();

	if (body.grant_type !== "client_credentials") {
		return c.json({ error: "unsupported_grant_type" }, 400);
	}

	if (!body.client_id) {
		return c.json({ error: "missing client_id" }, 400);
	}

	const scope = (body.scope ?? "").split(" ").filter(Boolean);
	const token = await issueToken({ sub: body.client_id, scope }, c.env.CACHE);

	return c.json({
		access_token: token,
		token_type: "Bearer",
		expires_in: 3600,
	});
});
