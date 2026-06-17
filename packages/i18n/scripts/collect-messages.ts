/**
 * Scans all packages for i18n/{locale}.json files and merges them into
 * packages/i18n/messages/{locale}.json, namespacing keys by package slug.
 *
 * Run: pnpm --filter @nivora-cms/i18n collect-messages
 *
 * Key format: {package-slug}.{key} — e.g. "content.editor.save"
 * The i18n package's own messages/en.json is used as the base and is NOT
 * re-namespaced (its keys already include the namespace, e.g. "admin.*").
 */
import { readdir, readFile, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagesRoot = join(__dirname, "../../../packages");
const messagesRoot = join(__dirname, "../messages");

async function exists(path: string): Promise<boolean> {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

async function readJsonFile(path: string): Promise<Record<string, string>> {
	const content = await readFile(path, "utf-8");
	return JSON.parse(content) as Record<string, string>;
}

async function collectMessages(locale: string): Promise<Record<string, string>> {
	const basePath = join(messagesRoot, `${locale}.json`);
	let base: Record<string, string> = {};

	if (await exists(basePath)) {
		base = await readJsonFile(basePath);
	}

	const packages = await readdir(packagesRoot, { withFileTypes: true });

	for (const pkg of packages) {
		if (!pkg.isDirectory() || pkg.name === "i18n") continue;

		const i18nPath = join(packagesRoot, pkg.name, "i18n", `${locale}.json`);
		if (!(await exists(i18nPath))) continue;

		const messages = await readJsonFile(i18nPath);
		const slug = pkg.name;

		for (const [key, value] of Object.entries(messages)) {
			base[`${slug}.${key}`] = value;
		}
	}

	return base;
}

async function main() {
	const baseLocale = "en";
	const otherLocales = ["nl"];
	const locales = [baseLocale, ...otherLocales];

	for (const locale of locales) {
		const merged = await collectMessages(locale);
		const sorted = Object.fromEntries(Object.entries(merged).sort(([a], [b]) => a.localeCompare(b)));
		const outPath = join(messagesRoot, `${locale}.json`);
		await writeFile(outPath, `${JSON.stringify(sorted, null, 2)}\n`, "utf-8");
		console.log(`✓ ${locale}: ${Object.keys(sorted).length} messages → ${outPath}`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
