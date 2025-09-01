'use client';
import { Box, Button, Paper, ThemeProvider, Typography } from '@mui/material';
import { memo, useMemo } from 'react';

import { BgPreset, ThemePreset } from '@/shared/config/brandingConfig';
import { buildBrandTheme } from '@/theme';

type Props = {
	themePreset: ThemePreset | null | undefined;
	primaryColor?: string;
	bgPreset: BgPreset;
};

/**
 * Live postcard-sized preview of the **current draft** branding theme.
 * Purely visual – does not mutate RHF state or make network calls.
 */
function ThemePreviewCardImpl({ themePreset, primaryColor, bgPreset }: Props) {
	const theme = useMemo(
		() =>
			buildBrandTheme({
				themePreset: themePreset ?? null,
				primaryColor: primaryColor?.trim() || undefined,
				bgPreset,
			}),
		[themePreset, primaryColor, bgPreset],
	);

	return (
		<ThemeProvider theme={theme}>
			<Paper
				elevation={1}
				sx={{
					width: 220,
					p: 2,
					borderRadius: 2,
					bgcolor: 'background.paper',
				}}>
				<Typography
					variant='subtitle1'
					gutterBottom>
					Preview
				</Typography>

				<Box
					sx={{
						display: 'flex',
						gap: 1,
						alignItems: 'center',
						justifyContent: 'space-between',
					}}>
					<Typography
						variant='body2'
						color='text.primary'>
						Headline
					</Typography>
					<Button
						size='small'
						variant='contained'>
						Action
					</Button>
				</Box>
			</Paper>
		</ThemeProvider>
	);
}

const ThemePreviewCard = memo(ThemePreviewCardImpl);
export default ThemePreviewCard;
