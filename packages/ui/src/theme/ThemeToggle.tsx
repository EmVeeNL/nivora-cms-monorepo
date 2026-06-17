import { Icon } from "@iconify/react";
import { cn } from "../utils.ts";
import { useTheme } from "./ThemeProvider.tsx";

interface ThemeToggleProps {
	className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
	const { theme, setTheme } = useTheme();
	return (
		<button
			type="button"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			aria-label="Toggle theme"
			className={cn(
				"flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
				className,
			)}
		>
			{theme === "dark" ? (
				<Icon icon="tabler:sun" width={16} height={16} />
			) : (
				<Icon icon="tabler:moon" width={16} height={16} />
			)}
		</button>
	);
}
