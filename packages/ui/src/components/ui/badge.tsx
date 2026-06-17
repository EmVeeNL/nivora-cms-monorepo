import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../utils.ts";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors",
	{
		variants: {
			variant: {
				default: "border-transparent bg-primary text-primary-foreground",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground",
				outline: "text-foreground",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

interface BadgeProps
	extends ComponentProps<"div">,
		VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { badgeVariants };
export type { BadgeProps };
