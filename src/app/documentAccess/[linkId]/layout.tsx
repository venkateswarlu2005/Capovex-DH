import { Grid2, Link, Typography } from '@mui/material';
import React from 'react';

import Providers from '@/app/providers';
import { BlueWaveLogo } from '@/components';
import { BrandingSettings, buildBrandTheme } from '@/theme/brand/buildBrandTheme';

interface RootLayoutProps {
	children: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Server-side fetch helpers                                          */
/* ------------------------------------------------------------------ */
async function fetchBranding(linkId: string): Promise<BrandingSettings | null> {
	const base = process.env.NEXT_PUBLIC_APP_URL!;
	try {
		const res = await fetch(`${base}/api/public_links/${linkId}/branding`, {
			cache: 'no-store', // never cache user branding
			next: { revalidate: 0 }, // …nor re-use between visitors
		});
		if (!res.ok) return null;

		const json = await res.json();
		return json?.data ?? null;
	} catch (e) {
		console.error('[layout] branding fetch failed:', e);
		return null;
	}
}

export default async function RootLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { linkId: string };
}) {
	const branding = await fetchBranding(params.linkId);
	const brandTheme = branding ? buildBrandTheme(branding) : undefined;
	return (
		<>
			<Providers themeOverride={brandTheme}>
				<Grid2
					container
					direction='column'
					justifyContent='center'
					alignItems='center'
					px={20}
					py={{ xs: 2, sm: 4, md: 6, lg: 8 }}
					height='100vh'
					rowGap={4}>
					{/* ── Row 1 ──── */}
					<Grid2>
						<BlueWaveLogo
							width='100%'
							height='2.5rem'
						/>
					</Grid2>
					{/* ── Row 2 ──── */}
					<Grid2
						container
						flexGrow={1}
						justifyContent='center'
						alignItems='center'
						overflow='auto'
						width='100%'>
						{children}
					</Grid2>
					{/* ── Row 3 ──── */}
					<Grid2>
						<Typography variant='body1'>
							Need help?&nbsp;
							<Link
								href='#support'
								underline='hover'
								variant='body1'>
								Contact Support
							</Link>
						</Typography>
					</Grid2>
				</Grid2>
			</Providers>
		</>
	);
}

export const dynamic = 'force-dynamic';
