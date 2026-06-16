import type { ReactNode } from "react";

interface TopBarProps {
	titleSlot?: ReactNode;
	searchSlot?: ReactNode;
	actionsSlot?: ReactNode;
	ctaSlot?: ReactNode;
}

function TopBar({ titleSlot, searchSlot, actionsSlot, ctaSlot }: TopBarProps) {
	return (
		<header
			className="sticky top-0 z-10 flex shrink-0 items-center gap-4 border-b border-border bg-background px-6"
			style={{ height: "var(--topbar-height)" }}
		>
			{titleSlot && <div className="shrink-0">{titleSlot}</div>}
			{searchSlot && <div className="flex-1">{searchSlot}</div>}
			{actionsSlot && <div className="shrink-0">{actionsSlot}</div>}
			{ctaSlot && <div className="shrink-0">{ctaSlot}</div>}
		</header>
	);
}

export { TopBar };
