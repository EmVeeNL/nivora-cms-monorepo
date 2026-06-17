import { Hono } from "hono";
import { keysRoute } from "./routes/keys.route.ts";
import { meRoute } from "./routes/me.route.ts";
import { refreshRoute } from "./routes/refresh.route.ts";
import { revokeRoute } from "./routes/revoke.route.ts";
import { tokenRoute } from "./routes/token.route.ts";

export const apiBasePath = "/api/auth" as const;

interface Env {
	CACHE: KVNamespace;
	DB: D1Database;
}

export const apiRouter = new Hono<{ Bindings: Env }>()
	.route("/token", tokenRoute)
	.route("/refresh", refreshRoute)
	.route("/revoke", revokeRoute)
	.route("/me", meRoute)
	.route("/keys", keysRoute);
