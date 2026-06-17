import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavItemProps {
	icon: ReactNode;
	label: string;
	isActive?: boolean;
	showLabel?: boolean;
	onClick?: () => void;
}

function NavItem({
	icon,
	label,
	isActive = false,
	showLabel = true,
	onClick,
}: NavItemProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			title={showLabel ? undefined : label}
			className={cn(
				"flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
				isActive
					? "bg-primary/10 text-primary"
					: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
				!showLabel && "justify-center px-2",
			)}
		>
			<span className="shrink-0">{icon}</span>
			{showLabel && <span className="truncate">{label}</span>}
		</button>
	);
}

export { NavItem };
export type { NavItemProps };
