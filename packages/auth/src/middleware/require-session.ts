import type { Auth } from "../auth.ts";
import { getSession, type Session } from "../services/session.service.ts";

export class UnauthorizedError extends Error {
	readonly status = 401;
	constructor() {
		super("Unauthorized");
	}
}

export async function requireSession(
	auth: Auth,
	headers: Headers,
): Promise<NonNullable<Session>> {
	const session = await getSession(auth, headers);
	if (!session) throw new UnauthorizedError();
	return session;
}
