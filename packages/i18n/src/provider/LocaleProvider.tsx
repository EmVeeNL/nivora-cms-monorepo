import { useState } from "react";
import { type Locale, LocaleContext } from "../context.ts";

interface LocaleProviderProps {
	locale: Locale;
	locales: readonly Locale[];
	onLocaleChange?: (locale: Locale) => void;
	children: React.ReactNode;
}

export function LocaleProvider({
	locale: initialLocale,
	locales,
	onLocaleChange,
	children,
}: LocaleProviderProps) {
	const [locale, setLocaleState] = useState<Locale>(initialLocale);

	const setLocale = (newLocale: Locale) => {
		setLocaleState(newLocale);
		onLocaleChange?.(newLocale);
	};

	return (
		<LocaleContext value={{ locale, setLocale, locales }}>
			{children}
		</LocaleContext>
	);
}
