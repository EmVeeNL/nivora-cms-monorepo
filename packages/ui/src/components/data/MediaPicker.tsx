import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { cn } from "../../utils.ts";
import { Button } from "../ui/button.tsx";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog.tsx";
import { Input } from "../ui/input.tsx";

interface MediaAsset {
	id: string;
	url: string;
	name: string;
	type?: string;
}

interface MediaPickerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (assets: MediaAsset[]) => void;
	onFetch: (options: {
		search?: string;
		type?: string;
		page?: number;
	}) => Promise<{ assets: MediaAsset[]; total: number }>;
	multiple?: boolean;
	title?: string;
}

export function MediaPicker({
	open,
	onOpenChange,
	onSelect,
	onFetch,
	multiple = false,
	title = "Select media",
}: MediaPickerProps) {
	const [assets, setAssets] = useState<MediaAsset[]>([]);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open) return;
		setLoading(true);
		onFetch({ search: search || undefined })
			.then(({ assets: a }) => setAssets(a))
			.finally(() => setLoading(false));
	}, [open, search, onFetch]);

	function toggleSelect(id: string) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				if (!multiple) next.clear();
				next.add(id);
			}
			return next;
		});
	}

	function handleConfirm() {
		const picks = assets.filter((a) => selected.has(a.id));
		onSelect(picks);
		onOpenChange(false);
		setSelected(new Set());
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<Input
					placeholder="Search assets…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				{loading ? (
					<div className="flex h-48 items-center justify-center text-muted-foreground">
						<Icon icon="tabler:loader-2" className="size-6 animate-spin" />
					</div>
				) : (
					<div className="grid max-h-80 grid-cols-4 gap-2 overflow-y-auto">
						{assets.map((asset) => (
							<button
								key={asset.id}
								type="button"
								onClick={() => toggleSelect(asset.id)}
								className={cn(
									"relative aspect-square overflow-hidden rounded-md border-2 transition-colors",
									selected.has(asset.id)
										? "border-primary"
										: "border-transparent hover:border-border",
								)}
							>
								<img
									src={asset.url}
									alt={asset.name}
									className="h-full w-full object-cover"
								/>
								{selected.has(asset.id) && (
									<div className="absolute inset-0 flex items-center justify-center bg-primary/20">
										<Icon icon="tabler:check" className="size-6 text-primary" />
									</div>
								)}
							</button>
						))}
					</div>
				)}
				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleConfirm} disabled={selected.size === 0}>
						Select {selected.size > 0 ? `(${selected.size})` : ""}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export type { MediaAsset, MediaPickerProps };
