import type { ReactNode } from "react";
import { cn } from "../../utils.ts";

type Cols = 1 | 2 | 3 | 4 | 6 | 12;
type Gap = "sm" | "md" | "lg";

interface ContentGridProps {
	children: ReactNode;
	cols?: Cols;
	gap?: Gap;
	className?: string;
}

const colsMap: Record<Cols, string> = {
	1: "grid-cols-1",
	2: "grid-cols-2",
	3: "grid-cols-3",
	4: "grid-cols-4",
	6: "grid-cols-6",
	12: "grid-cols-12",
};

const gapMap: Record<Gap, string> = {
	sm: "gap-3",
	md: "gap-6",
	lg: "gap-8",
};

export function ContentGrid({
	children,
	cols = 12,
	gap = "md",
	className,
}: ContentGridProps) {
	return (
		<div className={cn("grid", colsMap[cols], gapMap[gap], className)}>
			{children}
		</div>
	);
}
