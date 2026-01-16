import SignIn from '@/app/auth/sign-in/page';

import { Sidebar } from '@/components';

import { Box, CircularProgress } from '@mui/material';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { isPublicRoute } from '@/shared/config/routesConfig';

export default function AuthProvider({ children }: { children: ReactNode }) {
	const { data: session, status } = useSession();
	const pathname = usePathname(); // Get the current route path
	const [isLoading, setIsLoading] = useState(true);

	// useEffect to handle session status changes
	useEffect(() => {
		setIsLoading(status === 'loading');
	}, [status]);

	// Show a loading state while fetching the session
	if (isLoading) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				height='100vh'>
				<CircularProgress size={80} />
			</Box>
		);
	}

	/* ---------- unrestricted pages ---------- */
	if (isPublicRoute(pathname)) {
		return <>{children}</>;
	}

	/* ---------- auth‑guard ---------- */
	if (!session) {
		// Redirect the user to the sign-in page with a callback URL
		return <SignIn />;
	}

	return (
		<>
			<Box
				display='flex'
				bgcolor='background.content'
				height='100vh'
				width='100vw'>
				<Sidebar />
				<Box
					width='100%'
					py={{ sx: 4, sm: 10, md: 20 }}
					px={{ sx: 4, sm: 8, md: 30 }}>
					{children}
				</Box>
			</Box>
		</>
	);
}
