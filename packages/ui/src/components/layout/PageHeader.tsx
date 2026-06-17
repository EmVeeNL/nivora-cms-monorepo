import type { ReactNode } from "react";
import { cn } from "../../utils.ts";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface PageHeaderProps {
	title: string;
	description?: string;
	breadcrumb?: BreadcrumbItem[];
	actions?: ReactNode;
	className?: string;
}

export function PageHeader({
	title,
	description,
	breadcrumb,
	actions,
	className,
}: PageHeaderProps) {
	return (
		<div
			className={cn("flex items-start justify-between gap-4 py-6", className)}
		>
			<div>
				{breadcrumb && breadcrumb.length > 0 && (
					<nav className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
						{breadcrumb.map((item, i) => (
							<span key={item.label} className="flex items-center gap-1">
								{i > 0 && <span aria-hidden="true">/</span>}
								{item.href ? (
									<a
										href={item.href}
										className="hover:text-foreground transition-colors"
									>
										{item.label}
									</a>
								) : (
									<span>{item.label}</span>
								)}
							</span>
						))}
					</nav>
				)}
				<h1 className="text-2xl font-semibold text-foreground">{title}</h1>
				{description && (
					<p className="mt-1 text-sm text-muted-foreground">{description}</p>
				)}
			</div>
			{actions && (
				<div className="flex shrink-0 items-center gap-2">{actions}</div>
			)}
		</div>
	);
}

export type { PageHeaderProps, BreadcrumbItem };
