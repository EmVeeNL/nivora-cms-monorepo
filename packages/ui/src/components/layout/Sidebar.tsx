import type { ReactNode } from "react";

interface SidebarProps {
	logoSlot: ReactNode;
	navItems: ReactNode;
	userSlot: ReactNode;
}

export function Sidebar({ logoSlot, navItems, userSlot }: SidebarProps) {
	return (
		<div className="flex h-full flex-col">
			<div className="flex h-[var(--topbar-height)] shrink-0 items-center px-4">
				{logoSlot}
			</div>

			<nav className="flex-1 overflow-y-auto px-2 py-2">{navItems}</nav>

			<div className="shrink-0 border-t border-border p-3">{userSlot}</div>
		</div>
	);
}
