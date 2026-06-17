import { useEffect, useState } from "react";

interface UsePermissionOptions {
	permissions: string[];
	userPermissions: string[];
}

export function usePermission(
	permission: string,
	options: UsePermissionOptions,
): boolean {
	const [allowed, setAllowed] = useState(false);

	useEffect(() => {
		setAllowed(options.userPermissions.includes(permission));
	}, [permission, options.userPermissions]);

	return allowed;
}
