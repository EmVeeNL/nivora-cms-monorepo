import { createFileRoute } from "@tanstack/react-router";

import { TopBar } from "@nivora-cms/ui";

export const Route = createFileRoute("/_app/")({ component: Home });

function Home() {
	return (
		<div className="flex flex-1 flex-col">
			<TopBar
				titleSlot={
					<h1 className="text-base font-semibold text-foreground">Home</h1>
				}
			/>
			<div className="flex-1 p-6" />
		</div>
	);
}
