export type LocalizedString = string | Record<string, string>

export interface NavigationItem {
	label: LocalizedString
	/** Tabler icon slug — kebab-case, no prefix: 'layout-dashboard', 'file-text' */
	icon: string
	route: string
	group: string
	order?: number
	/** Hide item if user lacks this permission */
	permission?: string
	children?: Omit<NavigationItem, "group" | "children">[]
}

export type SettingsInputType =
	| "text"
	| "textarea"
	| "number"
	| "switch"
	| "checkbox"
	| "select"
	| "radio"
	| "tag-input"
	| "color"
	| "date"
	| "json"

interface SettingsBase {
	label: LocalizedString
	description?: LocalizedString
	required?: boolean
}

interface BooleanField extends SettingsBase {
	type: "boolean"
	input: "switch" | "checkbox"
	default?: boolean
}

interface NumberField extends SettingsBase {
	type: "number"
	input: "number"
	default?: number
	min?: number
	max?: number
}

interface StringField extends SettingsBase {
	type: "string"
	input: "text" | "textarea" | "color" | "date"
	default?: string
	validation?: { minLength?: number; maxLength?: number; pattern?: string }
}

interface SelectField extends SettingsBase {
	type: "string"
	input: "select" | "radio"
	default?: string
	options: Array<{ label: LocalizedString; value: string }>
}

interface ArrayField extends SettingsBase {
	type: "array"
	input: "tag-input"
	default?: string[]
	itemType: "string" | "number"
}

export type SettingsFieldConfig =
	| BooleanField
	| NumberField
	| StringField
	| SelectField
	| ArrayField

export interface PackageDbConfig {
	/** Relative path to Drizzle migration files */
	migrations?: string
	/** D1 table names owned by this package */
	tables?: string[]
}

export interface PackageHooks {
	beforeInstall?: () => Promise<void>
	afterInstall?: () => Promise<void>
	beforeUninstall?: () => Promise<void>
	afterUninstall?: () => Promise<void>
}

export interface PackageConfig {
	name: LocalizedString
	description?: LocalizedString
	version: string
	dependencies?: Record<string, string>

	/** Deep-merge over a base package — used for local module overrides in apps/admin/src/modules/ */
	extends?: string

	routes?: {
		/** Package exports adminRouteFactory */
		admin?: boolean
		/** Package exports apiRouter from ./api */
		api?: boolean
	}

	permissions?: string[]
	navigation?: NavigationItem | NavigationItem[]

	db?: PackageDbConfig
	hooks?: PackageHooks
	settings?: Record<string, SettingsFieldConfig>
	/** Informational — shown on install screen; used for dependency resolution */
	entities?: string[]
}

export function definePackageConfig(config: PackageConfig): PackageConfig {
	return config
}
