import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Icon } from "@iconify/react";
import type { ComponentProps } from "react";
import { cn } from "../../utils.ts";

export function RadioGroup({
	className,
	...props
}: ComponentProps<typeof RadioGroupPrimitive.Root>) {
	return (
		<RadioGroupPrimitive.Root
			className={cn("grid gap-2", className)}
			{...props}
		/>
	);
}

export function RadioGroupItem({
	className,
	...props
}: ComponentProps<typeof RadioGroupPrimitive.Item>) {
	return (
		<RadioGroupPrimitive.Item
			className={cn(
				"aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		>
			<RadioGroupPrimitive.Indicator className="flex items-center justify-center">
				<Icon icon="tabler:circle-filled" className="size-2.5 fill-primary text-primary" />
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	);
}
