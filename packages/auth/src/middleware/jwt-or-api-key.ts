import { createMiddleware } from "hono/factory";
import { verifyToken } from "../services/token.service.ts";

interface AuthEnv {
	CACHE: KVNamespace;
}

export interface JwtPayloadVar {
	sub: string;
	scope: string[];
	jti: string;
}

export const jwtOrApiKeyMiddleware = createMiddleware<{
	Bindings: AuthEnv;
	Variables: { jwtPayload: JwtPayloadVar };
}>(async (c, next) => {
	const authHeader = c.req.header("Authorization");

	if (authHeader?.startsWith("Bearer ")) {
		const token = authHeader.slice(7);
		const payload = await verifyToken(token, c.env.CACHE);

		if (!payload) {
			return c.json({ error: "Invalid or expired token" }, 401);
		}

		c.set("jwtPayload", payload);
		return next();
	}

	const apiKey = c.req.header("X-API-Key");
	if (apiKey) {
		// API keys are stored as SHA-256 hashes in D1.
		// Full validation wired in when content package adds the api_keys table.
		const keyHash = await hashApiKey(apiKey);
		c.set("jwtPayload", { sub: `apikey:${keyHash}`, scope: [], jti: "" });
		return next();
	}

	return c.json({ error: "Missing Authorization header or X-API-Key" }, 401);
});

async function hashApiKey(key: string): Promise<string> {
	const data = new TextEncoder().encode(key);
	const buffer = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(buffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}
