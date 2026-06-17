import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
	className?: string;
}

function ThemeToggle({ className }: ThemeToggleProps) {
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
			{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
		</button>
	);
}

export { ThemeToggle };
