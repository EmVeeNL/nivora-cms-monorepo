import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { cn } from "../../utils.ts";
import { Button } from "../ui/button.tsx";

interface EmptyStateProps {
	icon?: string;
	title: string;
	description?: string;
	action?: { label: string; onClick: () => void };
	className?: string;
	children?: ReactNode;
}

export function EmptyState({
	icon,
	title,
	description,
	action,
	className,
	children,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-4 py-16 text-center",
				className,
			)}
		>
			{icon && (
				<Icon
					icon={`tabler:${icon}`}
					className="size-12 text-muted-foreground"
				/>
			)}
			<div>
				<h3 className="font-semibold text-foreground">{title}</h3>
				{description && (
					<p className="mt-1 text-sm text-muted-foreground">{description}</p>
				)}
			</div>
			{children}
			{action && <Button onClick={action.onClick}>{action.label}</Button>}
		</div>
	);
}
