import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(() => {
		if (typeof document === "undefined") return "dark";
		const m = document.cookie.match(/\btheme=([^;]+)/);
		return (m?.[1] as Theme) ?? "dark";
	});

	useEffect(() => {
		const cls = document.documentElement.className;
		if (cls === "light" || cls === "dark") setThemeState(cls);
	}, []);

	function setTheme(t: Theme) {
		setThemeState(t);
		// biome-ignore lint/suspicious/noDocumentCookie: CookieStore API is async/not SSR-compatible; document.cookie is intentional for sync theme persistence
		document.cookie = `theme=${t};path=/;max-age=${365 * 24 * 3600}`;
		document.documentElement.className = t;
	}

	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}
