import type { ReactNode } from "react";

interface AppShellProps {
	sidebar: ReactNode;
	children: ReactNode;
}

function AppShell({ sidebar, children }: AppShellProps) {
	return (
		<div className="relative flex h-screen overflow-hidden bg-sidebar-bg py-3 pr-3">
			{/* .dark forces all sidebar color tokens to dark-mode values regardless of page theme */}
			<aside
				className="dark fixed inset-y-0 left-0 z-20 flex flex-col bg-sidebar-bg"
				style={{ width: "var(--sidebar-width)" }}
			>
				{sidebar}
			</aside>

			{/* Main panel — inset from top, right, bottom; left stays flush with sidebar */}
			<main
				className="flex flex-1 flex-col overflow-y-auto rounded-2xl bg-background shadow-[-4px_0_20px_0_rgba(0,0,0,0.12)]"
				style={{ marginLeft: "var(--sidebar-width)" }}
			>
				{children}
			</main>
		</div>
	);
}

export { AppShell };
