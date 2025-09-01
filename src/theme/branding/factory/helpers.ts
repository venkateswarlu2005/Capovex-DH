import { TonalPalette, hexFromArgb } from '@material/material-color-utilities';
import chroma from 'chroma-js';

import { presetPaletteMap } from '../data/presetPaletteMap';

/** Returns '#FFFFFF' or '#111111' – whichever meets 4.5 : 1 contrast */
export const chooseContrast = (hex: string) =>
	chroma.contrast(hex, '#FFFFFF') >= 4.5 ? '#FFFFFF' : '#111111';

export const rampToMui = (r: Record<keyof any, string>) => ({
	main: r[60],
	light: r[90],
	dark: r[40],
	contrastText: chooseContrast(r[60]),
});

/** Convert a Material-3 tone (0–100) from a TonalPalette to hex */
export const tone = (
	p: TonalPalette,
	t: 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 95 | 99 | 100,
) => hexFromArgb(p.tone(t));

/*  Tiny helper so TS keeps the exhaustive-ness check for new presets.  */
export function isThemePreset(val: string): val is keyof typeof presetPaletteMap {
	return Object.prototype.hasOwnProperty.call(presetPaletteMap, val);
}
