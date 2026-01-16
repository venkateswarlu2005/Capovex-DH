'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

import { CssBaseline, Theme, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import AuthProvider from '@/providers/auth/AuthProvider';
import { ModalProvider } from '@/providers/modal/ModalProvider';
import QueryProvider from '@/providers/query/QueryProvider';
import { ToastProvider } from '@/providers/toast/ToastProvider';

import { LoadingSpinner } from '@/components';
import mainTheme from '@/theme/mainTheme';
import { BrandingSetting } from '@/shared/models';
import { buildBrandTheme } from '@/theme';

export default function Providers({
	children,
	branding,
}: {
	children: React.ReactNode;
	branding?: BrandingSetting | null;
}) {
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	const theme = useMemo(
		() => (branding ? buildBrandTheme(branding) : mainTheme),
		[branding], // mainTheme is module-level stable
	);

	if (!isHydrated) {
		// Show a loading spinner while the client-side is hydrating
		return <LoadingSpinner />;
	}

	return (
		<SessionProvider>
			<AppRouterCacheProvider>
				<ThemeProvider theme={theme}>
					<CssBaseline enableColorScheme />
					<ToastProvider>
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<QueryProvider>
								<ModalProvider>
									<AuthProvider>{children}</AuthProvider>
								</ModalProvider>
							</QueryProvider>
						</LocalizationProvider>
					</ToastProvider>
				</ThemeProvider>
			</AppRouterCacheProvider>
		</SessionProvider>
	);
}
