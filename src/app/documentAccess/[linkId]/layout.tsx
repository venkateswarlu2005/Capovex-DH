import { Box, Grid2, Link, Typography } from '@mui/material';
import React from 'react';

import Providers from '@/app/providers';

import { BrandingSetting } from '@/shared/models';
import BrandHeader from './components/BrandHeader';

/* ------------------------------------------------------------------ */
/*  Server-side fetch helpers                                         */
/* ------------------------------------------------------------------ */
async function fetchBranding(linkId: string): Promise<BrandingSetting | null> {
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

export default async function DocumentAccessLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ linkId: string }>;
}) {
	const { linkId } = await params;

	const branding = await fetchBranding(linkId);

	return (
		<>
			<Providers branding={branding}>
				<Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
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
							<BrandHeader branding={branding} />
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
				</Box>
			</Providers>
		</>
	);
}

export const dynamic = 'force-dynamic';
