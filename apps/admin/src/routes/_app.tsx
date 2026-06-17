import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
	BarChart2,
	FileText,
	HelpCircle,
	Home,
	Library,
	Mail,
	Package,
	Settings,
	Users,
	Wallet,
} from "lucide-react";

import { NavItem } from "@/components/NavItem";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppShell } from "@/layouts/AppShell";
import { Sidebar } from "@/layouts/Sidebar";

export const Route = createFileRoute("/_app")({
	component: AppLayout,
});

const NAV_ITEMS = [
	{ icon: <Home size={18} />, label: "Home" },
	{ icon: <Package size={18} />, label: "Products" },
	{ icon: <Mail size={18} />, label: "Email" },
	{ icon: <Users size={18} />, label: "Customers" },
	{ icon: <Wallet size={18} />, label: "Payouts" },
	{ icon: <BarChart2 size={18} />, label: "Analytics" },
	{ icon: <Library size={18} />, label: "Library" },
	{ icon: <FileText size={18} />, label: "Content" },
] as const;

const BOTTOM_NAV = [
	{ icon: <Settings size={18} />, label: "Settings" },
	{ icon: <HelpCircle size={18} />, label: "Help" },
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
									icon={item.icon}
									label={item.label}
									isActive={i === 0}
								/>
							))}
							<div className="my-2 border-t border-border" />
							{BOTTOM_NAV.map((item) => (
								<NavItem key={item.label} icon={item.icon} label={item.label} />
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
