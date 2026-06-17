/** Read a package setting from KV. Key format: `settings:<pkg>:<key>` */
export async function getSetting<T>(
	kv: KVNamespace,
	pkg: string,
	key: string,
): Promise<T | null> {
	return kv.get<T>(`settings:${pkg}:${key}`, "json");
}

/** Write a package setting to KV. Key format: `settings:<pkg>:<key>` */
export async function setSetting<T>(
	kv: KVNamespace,
	pkg: string,
	key: string,
	value: T,
): Promise<void> {
	await kv.put(`settings:${pkg}:${key}`, JSON.stringify(value));
}
