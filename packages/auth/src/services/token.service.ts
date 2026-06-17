import {
	exportJWK,
	generateKeyPair,
	importJWK,
	jwtVerify,
	SignJWT,
} from "jose";

const KV_KEY_CURRENT = "jwt:keys:current";
const KV_KEY_PREVIOUS = "jwt:keys:previous";
const KV_KEY_REVOKED_PREFIX = "jwt:revoked:";

interface KeyPair {
	privateKey: JsonWebKey;
	publicKey: JsonWebKey;
	kid: string;
}

export interface TokenPayload {
	sub: string;
	scope: string[];
	jti: string;
}

async function getOrCreateKeys(kv: KVNamespace): Promise<KeyPair> {
	const cached = await kv.get<KeyPair>(KV_KEY_CURRENT, "json");
	if (cached) return cached;

	const { privateKey, publicKey } = await generateKeyPair("RS256");
	const kid = crypto.randomUUID();
	const pair: KeyPair = {
		privateKey: await exportJWK(privateKey),
		publicKey: await exportJWK(publicKey),
		kid,
	};

	await kv.put(KV_KEY_CURRENT, JSON.stringify(pair), {
		expirationTtl: 60 * 60 * 24 * 90,
	});

	return pair;
}

export async function issueToken(
	payload: Omit<TokenPayload, "jti">,
	kv: KVNamespace,
	expiresInSeconds = 3600,
): Promise<string> {
	const keys = await getOrCreateKeys(kv);
	const privateKey = await importJWK(keys.privateKey, "RS256");
	const jti = crypto.randomUUID();

	return new SignJWT({ scope: payload.scope })
		.setProtectedHeader({ alg: "RS256", kid: keys.kid })
		.setSubject(payload.sub)
		.setJti(jti)
		.setIssuedAt()
		.setExpirationTime(`${expiresInSeconds}s`)
		.sign(privateKey);
}

export async function verifyToken(
	token: string,
	kv: KVNamespace,
): Promise<TokenPayload | null> {
	const candidates = await Promise.all([
		kv.get<KeyPair>(KV_KEY_CURRENT, "json"),
		kv.get<KeyPair>(KV_KEY_PREVIOUS, "json"),
	]);

	for (const keys of candidates) {
		if (!keys) continue;
		try {
			const publicKey = await importJWK(keys.publicKey, "RS256");
			const { payload } = await jwtVerify(token, publicKey);

			const jti = payload.jti;
			if (jti && (await kv.get(`${KV_KEY_REVOKED_PREFIX}${jti}`))) return null;

			return {
				sub: payload.sub as string,
				scope: (payload.scope as string[]) ?? [],
				jti: jti as string,
			};
		} catch {
			// try next key
		}
	}

	return null;
}

export async function revokeToken(
	jti: string,
	kv: KVNamespace,
	ttl = 3600,
): Promise<void> {
	await kv.put(`${KV_KEY_REVOKED_PREFIX}${jti}`, "1", { expirationTtl: ttl });
}

export async function rotateKeys(kv: KVNamespace): Promise<void> {
	const current = await kv.get<KeyPair>(KV_KEY_CURRENT, "json");
	if (current) {
		await kv.put(KV_KEY_PREVIOUS, JSON.stringify(current), {
			expirationTtl: 60 * 60 * 24 * 2,
		});
	}
	await kv.delete(KV_KEY_CURRENT);
}
