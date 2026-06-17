import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type SortingState,
} from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { Button } from "../ui/button.tsx";
import { cn } from "../../utils.ts";

interface DataTableProps<TData> {
	data: TData[];
	columns: ColumnDef<TData, unknown>[];
	className?: string;
}

export function DataTable<TData>({
	data,
	columns,
	className,
}: DataTableProps<TData>) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		data,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div className={cn("w-full space-y-2", className)}>
			<div className="rounded-md border border-border">
				<table className="w-full text-sm">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className="border-b border-border">
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="h-10 px-4 text-left font-medium text-muted-foreground"
									>
										{header.isPlaceholder ? null : (
											<button
												type="button"
												onClick={header.column.getToggleSortingHandler()}
												className={cn(
													"flex items-center gap-1",
													header.column.getCanSort() && "cursor-pointer hover:text-foreground",
												)}
											>
												{flexRender(header.column.columnDef.header, header.getContext())}
												{header.column.getIsSorted() === "asc" && (
													<Icon icon="tabler:sort-ascending" className="size-3.5" />
												)}
												{header.column.getIsSorted() === "desc" && (
													<Icon icon="tabler:sort-descending" className="size-3.5" />
												)}
											</button>
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									className="border-b border-border last:border-0 hover:bg-muted/50"
								>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="p-4">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={columns.length}
									className="h-24 text-center text-muted-foreground"
								>
									No results.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<div className="flex items-center justify-end gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
				</Button>
			</div>
		</div>
	);
}

export type { DataTableProps };
