import { useLocaleContext } from "../context.ts";

interface LocaleSwitcherProps {
	labels?: Record<string, string>;
	className?: string;
}

const defaultLabels: Record<string, string> = {
	en: "English",
	nl: "Nederlands",
};

export function LocaleSwitcher({
	labels = defaultLabels,
	className,
}: LocaleSwitcherProps) {
	const { locale, setLocale, locales } = useLocaleContext();

	return (
		<select
			value={locale}
			onChange={(e) => setLocale(e.target.value)}
			className={className}
			aria-label="Select language"
		>
			{locales.map((loc) => (
				<option key={loc} value={loc}>
					{labels[loc] ?? loc}
				</option>
			))}
		</select>
	);
}
