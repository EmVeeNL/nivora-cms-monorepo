import type { FormEvent, ReactNode } from "react";
import { Button } from "../ui/button.tsx";
import { cn } from "../../utils.ts";

interface DataFormProps {
	onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
	children: ReactNode;
	submitLabel?: string;
	cancelLabel?: string;
	onCancel?: () => void;
	className?: string;
}

export function DataForm({
	onSubmit,
	children,
	submitLabel = "Save",
	cancelLabel,
	onCancel,
	className,
}: DataFormProps) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit(e);
			}}
			className={cn("space-y-4", className)}
		>
			{children}
			<div className="flex justify-end gap-2">
				{onCancel && (
					<Button type="button" variant="outline" onClick={onCancel}>
						{cancelLabel ?? "Cancel"}
					</Button>
				)}
				<Button type="submit">{submitLabel}</Button>
			</div>
		</form>
	);
}
