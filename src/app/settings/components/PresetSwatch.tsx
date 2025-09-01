'use client';
import { Box } from '@mui/material';

import { ThemePreset } from '@/shared/config/brandingConfig';
import { presetPaletteMap } from '@/theme';

/**
 * Tiny row of coloured dots that visually summarises a preset theme.
 * Safe to embed inside MenuItem, Typography, buttons, etc.
 */
export default function PresetSwatch({ name }: { name: ThemePreset }) {
	const p = presetPaletteMap[name];
	console.log('🚀 ~ PresetSwatch ~ p:', p);

	// Pick any 4–5 representative hues (60-tone keeps contrast predictable)
	const hues = [p.primary[60], p.secondary[60], p.tertiary[60], p.success[60]];
	console.log('🚀 ~ PresetSwatch ~ hues:', hues);

	return (
		<Box
			aria-hidden
			sx={{ display: 'inline-flex', gap: 0.5, ml: 1 }}>
			{hues.map((hex) => (
				<Box
					key={hex}
					sx={{
						width: 12,
						height: 12,
						borderRadius: '50%',
						bgcolor: hex,
						border: '1px solid rgba(0,0,0,.15)',
					}}
				/>
			))}
		</Box>
	);
}
