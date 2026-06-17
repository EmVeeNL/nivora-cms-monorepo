import type { Auth } from "../auth.ts";

export type Session = Awaited<ReturnType<Auth["api"]["getSession"]>>;

export async function getSession(
	auth: Auth,
	headers: Headers,
): Promise<Session> {
	return auth.api.getSession({ headers });
}
