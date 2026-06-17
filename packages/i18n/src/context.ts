import { createContext, useContext } from "react";

export type Locale = string;

export interface LocaleContextValue {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	locales: readonly Locale[];
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocaleContext(): LocaleContextValue {
	const ctx = useContext(LocaleContext);
	if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
	return ctx;
}
