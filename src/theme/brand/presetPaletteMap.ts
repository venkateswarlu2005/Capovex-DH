/* -------------------------------------------------------------------------- *
 * presetPaletteMap.ts – hand-curated BrandPalette tokens (pure data layer)   *
 * -------------------------------------------------------------------------- *
 * - Each entry is a fully expanded palette ramp plus semantic colours.       *
 * - NO imports from MUI or colour-science libs – safe for design-time edits. *
 * -------------------------------------------------------------------------- */

// REMOVE THIS COMMENT BLOCK
/* -------------------------------------------------------------------------- *
 *  presetPaletteMap.ts                                                       *
 *  ------------------------------------------------------------------------- *
 *  PURPOSE                                                                  *
 *  -------                                                                  *
 *  • Acts as the **single source-of-truth** for every *preset* brand theme   *
 *    (a.k.a. “one-click colour schemes”) that users can choose in settings.  *
 *  • Pure **data-only** module – **NO** `@mui/material` imports, no helpers, *
 *    no chroma.js.  Easy for designers (or AI scripts) to edit in VS Code.   *
 *                                                                            *
 *  HOW TO READ / EXTEND                                                     *
 *  ------------------                                                       *
 *  • Each preset is a `BrandPalette`: a set of **tone ramps** (20-95) for    *
 *    every hue we care about.                                               *
 *      – 20  darkest tone   (≈ 800/900 in Tailwind terms)                   *
 *      – 40  regular “dark”                                                 *
 *      – 60  brand “main” → becomes `theme.palette.<hue>.main`              *
 *      – 80  regular “light”                                                *
 *      – 90  very light  → usually used for `*.light` or hover overlays     *
 *      – 95  near-white tint                                                *
 *  • A **ramp has *exactly* those six keys**.  Do not add 10 / 100 etc.      *
 *  • When you create a new preset (“aqua”, “blossom”…):                      *
 *      1. Copy the comment-block blueprint below.                            *
 *      2. Paste your six-tone ramps (use Material Theme Builder tones).      *
 *      3. Keep hexes **sorted numerically** (20 ➜ 95).                      *
 *      4. Commit – TypeScript will scream if you miss one tone.             *
 *                                                                            *
 *  DESIGNER QUICK START                                                     *
 *  --------------------                                                     *
 *  • Open **https://material-foundation.github.io/material-theme-builder**   *
 *  • Drop your seed colour(s) (primary, secondary… or use Huemint export)    *
 *  • Export JSON → look under `"palettes"`                                   *
 *  • Pick tones 20 40 60 80 90 95 for each palette                           *
 *  • Fill them into the object below.                                        *
 *                                                                            *
 *  NOTE                                                                     *
 *  ----                                                                     *
 *  – This file is consumed by `createPresetTheme.ts`, which maps the ramps   *
 *    to MUI’s `main/light/dark`, builds `hover` alpha, etc.                  *
 *  – **Do not** import MUI, do not mutate `globalTheme` here.                *
 * -------------------------------------------------------------------------- */

import { THEME_PRESETS } from '@/shared/config/brandingConfig';
import { BrandPalette } from '../themeTypes';

type ThemePreset = (typeof THEME_PRESETS)[number];
/* -------------------------------------------------------------------------- *
 * Curated starter set                                                        *
 * -------------------------------------------------------------------------- */
export const presetPaletteMap: Record<ThemePreset, BrandPalette> = {
	/* -------------------------------------------------------------------- *
	 * LAVENDER ‒ soft, floral brand                                       *
	 * -------------------------------------------------------------------- *
	 *   • Seed   : #175CD3                                                   *
	 *   • Contrast: AA compliant against white and dark navy surfaces        *
	 * -------------------------------------------------------------------- */
	lavender: {
		primary: {
			20: '#175CD3',
			40: '#1C7CF5',
			60: '#2688F7',
			80: '#3895FA',
			90: '#4DA2FD',
			95: '#73B7FF',
		},
		secondary: {
			20: '#4527A0',
			40: '#5E35B1',
			60: '#7E57C2', // main
			80: '#B39DDB',
			90: '#D1C4E9',
			95: '#F3E5F5',
		},
		tertiary: {
			20: '#AD1457',
			40: '#C2185B',
			60: '#D81B60', // main
			80: '#EC407A',
			90: '#F48FB1',
			95: '#FCE4EC',
		},
		neutral: {
			20: '#1A1F36',
			40: '#2D3748',
			60: '#4A5568', // main
			80: '#EDF2F7',
			90: '#F7FAFC',
			95: '#FFFFFF',
		},
		success: {
			20: '#2E5933',
			40: '#3F7A49',
			60: '#5BA065',
			80: '#8BC093',
			90: '#B9DCC0',
			95: '#EAF6EC',
		},
		warning: {
			20: '#4C2F00',
			40: '#875A17',
			60: '#D9902D',
			80: '#E8AA54',
			90: '#F5D7AF',
			95: '#FEF5E9',
		},
		error: {
			20: '#7F1A13',
			40: '#CE3C2E',
			60: '#F44336',
			80: '#F77B70',
			90: '#FBBFBA',
			95: '#FDE9E7',
		},
	},

	/* -------------------------------------------------------------------- *
	 * MIDNIGHT ‒ dark, nautical blue brand                                 *
	 * -------------------------------------------------------------------- *
	 *   • Seed   : #12222B                                                 *
	 *   • Contrast: AA compliant against white and dark navy surfaces      *
	 * -------------------------------------------------------------------- */
	midnight: {
		primary: {
			20: '#23323C',
			40: '#51616B',
			60: '#82939E',
			80: '#B8C9D5',
			90: '#D4E5F1',
			95: '#E3F3FF',
		},
		secondary: {
			20: '#1A343F',
			40: '#49626E',
			60: '#7B94A2',
			80: '#B0CAD9',
			90: '#CCE7F6',
			95: '#E0F4FF',
		},
		tertiary: {
			20: '#313032',
			40: '#605E60',
			60: '#939092',
			80: '#C9C5C8',
			90: '#E6E1E4',
			95: '#F4EFF2',
		},
		neutral: {
			20: '#2E3133',
			40: '#5C5F61',
			60: '#8F9193',
			80: '#C5C6C9',
			90: '#E1E2E5',
			95: '#F0F1F3',
		},
		success: {
			20: '#1E5631',
			40: '#2E7D4F',
			60: '#3FAF6B',
			80: '#6BCF91',
			90: '#A3E5B8',
			95: '#DFF6E5',
		},
		warning: {
			20: '#7A3E00',
			40: '#B55A00',
			60: '#FF8C00',
			80: '#FFB74D',
			90: '#FFD9A3',
			95: '#FFF3E0',
		},
		error: {
			20: '#6A1B1A',
			40: '#A93226',
			60: '#E74C3C',
			80: '#F1948A',
			90: '#FADBD8',
			95: '#FDEDEC',
		},
	},

	/* -------------------------------------------------------------------- *
	 *  PLACEHOLDERS for: aqua, blossom, graphite, … (to be authored later)  *
	 *  Copy-paste the “midnight” block, swap hexes with your new ramps.      *
	 * -------------------------------------------------------------------- */
	aqua: {} as unknown as BrandPalette,
	blossom: {} as unknown as BrandPalette,
	graphite: {} as unknown as BrandPalette,
	sunset: {} as unknown as BrandPalette,
	mint: {} as unknown as BrandPalette,
} as const;
/* -------------------------------------------------------------------------- *
 *  ✍🏻 How to add a new palette                                              *
 *  ------------------------------------------------------------------------- *
 *  1.  Duplicate the “midnight” object, rename the key to your preset name.   *
 *  2.  Replace every hex with the corresponding tone from MTB “palettes”.     *
 *      – primary    ➜ palettes.primary[20/40/60/80/90/95]                     *
 *      – secondary  ➜ palettes.secondary[...]                                 *
 *      – tertiary   ➜ palettes.tertiary[...]                                  *
 *      – neutral    ➜ palettes.neutral[...]                                   *
 *      – success / warning: use `extendedColors` OR craft complementary ramp. *
 *      – error      : use palettes.error or Material Red as seed.             *
 *  3.  Do NOT add alpha values here.  Derivatives (hover, focus, etc.) are     *
 *      calculated in `createPresetTheme.ts`.                                  *
 *  4.  Commit – TypeScript will enforce tone keys & missing fields.            *
 * -------------------------------------------------------------------------- */
