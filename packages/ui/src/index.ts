// Theme
export { ThemeProvider, useTheme } from "./theme/ThemeProvider.ts";
export { ThemeToggle } from "./theme/ThemeToggle.tsx";
export type { Theme } from "./theme/ThemeProvider.ts";

// Utilities
export { cn } from "./utils.ts";

// UI primitives
export { Button, buttonVariants } from "./components/ui/button.tsx";
export type { ButtonProps } from "./components/ui/button.tsx";
export { Badge, badgeVariants } from "./components/ui/badge.tsx";
export type { BadgeProps } from "./components/ui/badge.tsx";
export { Separator } from "./components/ui/separator.tsx";
export { Input } from "./components/ui/input.tsx";
export { Label } from "./components/ui/label.tsx";
export {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "./components/ui/card.tsx";
export {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "./components/ui/avatar.tsx";
export {
	TooltipProvider,
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "./components/ui/tooltip.tsx";
export {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuGroup,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
	DropdownMenuRadioGroup,
} from "./components/ui/dropdown-menu.tsx";
export {
	Dialog,
	DialogTrigger,
	DialogPortal,
	DialogClose,
	DialogOverlay,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
} from "./components/ui/dialog.tsx";
export {
	Select,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectLabel,
	SelectSeparator,
} from "./components/ui/select.tsx";
export { Switch } from "./components/ui/switch.tsx";
export { RadioGroup, RadioGroupItem } from "./components/ui/radio-group.tsx";

// Layout
export { AppShell } from "./components/layout/AppShell.tsx";
export { Sidebar } from "./components/layout/Sidebar.tsx";
export { TopBar } from "./components/layout/TopBar.tsx";
export { NavItem } from "./components/layout/NavItem.tsx";
export type { NavItemProps } from "./components/layout/NavItem.tsx";
export { PageHeader } from "./components/layout/PageHeader.tsx";
export type { PageHeaderProps, BreadcrumbItem } from "./components/layout/PageHeader.tsx";
export { ContentGrid } from "./components/layout/ContentGrid.tsx";

// Data
export { DataTable } from "./components/data/DataTable.tsx";
export type { DataTableProps } from "./components/data/DataTable.tsx";
export { DataForm } from "./components/data/DataForm.tsx";
export { TagInput } from "./components/data/TagInput.tsx";
export { MediaPicker } from "./components/data/MediaPicker.tsx";
export type { MediaAsset, MediaPickerProps } from "./components/data/MediaPicker.tsx";

// Feedback
export { toasts, Toaster } from "./components/feedback/toasts.ts";
export { CommandPalette } from "./components/feedback/CommandPalette.tsx";
export { ConfirmDialog } from "./components/feedback/ConfirmDialog.tsx";
export { EmptyState } from "./components/feedback/EmptyState.tsx";
