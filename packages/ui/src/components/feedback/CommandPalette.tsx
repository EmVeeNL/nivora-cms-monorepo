import { useEffect } from "react";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "cmdk";
import { Icon } from "@iconify/react";

interface PaletteCommand {
	id: string;
	label: string;
	icon?: string;
	onSelect: () => void;
	group?: string;
}

interface CommandPaletteProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	commands?: PaletteCommand[];
}

export function CommandPalette({
	open,
	onOpenChange,
	commands = [],
}: CommandPaletteProps) {
	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				onOpenChange(!open);
			}
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [open, onOpenChange]);

	const groups = commands.reduce<Record<string, PaletteCommand[]>>(
		(acc, cmd) => {
			const g = cmd.group ?? "Actions";
			if (!acc[g]) acc[g] = [];
			acc[g].push(cmd);
			return acc;
		},
		{},
	);

	return (
		<CommandDialog open={open} onOpenChange={onOpenChange}>
			<Command className="rounded-lg border border-border shadow-md">
				<CommandInput placeholder="Type a command or search…" />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					{Object.entries(groups).map(([group, items], i) => (
						<span key={group}>
							{i > 0 && <CommandSeparator />}
							<CommandGroup heading={group}>
								{items.map((cmd) => (
									<CommandItem
										key={cmd.id}
										onSelect={() => {
											cmd.onSelect();
											onOpenChange(false);
										}}
									>
										{cmd.icon && (
											<Icon icon={`tabler:${cmd.icon}`} className="mr-2 size-4" />
										)}
										{cmd.label}
									</CommandItem>
								))}
							</CommandGroup>
						</span>
					))}
				</CommandList>
			</Command>
		</CommandDialog>
	);
}
