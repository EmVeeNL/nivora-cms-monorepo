import { Icon } from "@iconify/react";
import { AppShell, NavItem, Sidebar, ThemeToggle } from "@nivora-cms/ui";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
	component: AppLayout,
});

const NAV_ITEMS = [
	{ icon: "home", label: "Home" },
	{ icon: "package", label: "Products" },
	{ icon: "mail", label: "Email" },
	{ icon: "users", label: "Customers" },
	{ icon: "wallet", label: "Wallet" },
	{ icon: "chart-bar-2", label: "Analytics" },
	{ icon: "books", label: "Library" },
	{ icon: "file-text", label: "Content" },
] as const;

const BOTTOM_NAV = [
	{ icon: "settings", label: "Settings" },
	{ icon: "help-circle", label: "Help" },
] as const;

function AppLayout() {
	return (
		<AppShell
			sidebar={
				<Sidebar
					logoSlot={
						<span className="text-base font-semibold text-foreground">
							NIVORA
						</span>
					}
					navItems={
						<div className="flex flex-col gap-1">
							{NAV_ITEMS.map((item, i) => (
								<NavItem
									key={item.label}
									icon={
										<Icon icon={`tabler:${item.icon}`} width={18} height={18} />
									}
									label={item.label}
									isActive={i === 0}
								/>
							))}
							<div className="my-2 border-t border-border" />
							{BOTTOM_NAV.map((item) => (
								<NavItem
									key={item.label}
									icon={
										<Icon icon={`tabler:${item.icon}`} width={18} height={18} />
									}
									label={item.label}
								/>
							))}
						</div>
					}
					userSlot={
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
								DL
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate text-xs font-medium text-foreground">
									Design Lab
								</p>
								<p className="truncate text-xs text-muted-foreground">
									admin@nivora.local
								</p>
							</div>
							<ThemeToggle />
						</div>
					}
				/>
			}
		>
			<Outlet />
		</AppShell>
	);
}
