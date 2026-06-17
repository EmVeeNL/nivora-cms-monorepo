import { Icon } from "@iconify/react";
import type { KeyboardEvent } from "react";
import { useState } from "react";
import { cn } from "../../utils.ts";

interface TagInputProps {
	value: string[];
	onChange: (tags: string[]) => void;
	placeholder?: string;
	className?: string;
}

export function TagInput({
	value,
	onChange,
	placeholder = "Add tag…",
	className,
}: TagInputProps) {
	const [draft, setDraft] = useState("");

	function addTag(tag: string) {
		const trimmed = tag.trim();
		if (trimmed && !value.includes(trimmed)) {
			onChange([...value, trimmed]);
		}
		setDraft("");
	}

	function removeTag(tag: string) {
		onChange(value.filter((t) => t !== tag));
	}

	function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addTag(draft);
		} else if (e.key === "Backspace" && draft === "" && value.length > 0) {
			onChange(value.slice(0, -1));
		}
	}

	return (
		<div
			className={cn(
				"flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-1.5 text-sm focus-within:ring-1 focus-within:ring-ring",
				className,
			)}
		>
			{value.map((tag) => (
				<span
					key={tag}
					className="flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
				>
					{tag}
					<button
						type="button"
						onClick={() => removeTag(tag)}
						aria-label={`Remove ${tag}`}
						className="opacity-60 hover:opacity-100"
					>
						<Icon icon="tabler:x" className="size-3" />
					</button>
				</span>
			))}
			<input
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				onKeyDown={handleKeyDown}
				onBlur={() => addTag(draft)}
				placeholder={value.length === 0 ? placeholder : ""}
				className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
			/>
		</div>
	);
}
