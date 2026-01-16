/* -------------------------------------------------------------------------- *
 * presetPaletteMap.ts – hand-curated BrandPalette tokens (pure data layer)   *
 * -------------------------------------------------------------------------- *
 * - Each entry is a fully expanded palette ramp plus semantic colours.       *
 * - NO imports from MUI or colour-science libs – safe for design-time edits. *
 * -------------------------------------------------------------------------- */

import { THEME_PRESETS } from '@/shared/config/brandingConfig';
import { BrandPalette } from '@/shared/models';

type ThemePreset = (typeof THEME_PRESETS)[number];
/* -------------------------------------------------------------------------- *
 * Curated starter set                                                        *
 * -------------------------------------------------------------------------- */
export const presetPaletteMap: Record<ThemePreset, BrandPalette> = {
	/* -------------------------------------------------------------------- *
	 * LAVENDER ‒ soft, floral brand                                        *
	 * -------------------------------------------------------------------- *
	 *   • Seed   : #175CD3                                               *
	 *   • Contrast: AA compliant against white and dark navy surfaces      *
	 * -------------------------------------------------------------------- */
	lavender: {
		primary: {
			20: '#0A56BA',
			40: '#0E60CE',
			60: '#0F6EEA',
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
	 *   • Seed   : #12222B                                               *
	 *   • Contrast: AA compliant against white and dark navy surfaces      *
	 * -------------------------------------------------------------------- */
	midnight: {
		primary: {
			20: '#23323C',
			40: '#51616B',
			60: '#5F7480',
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
	 * AQUA ‒ fresh, aquatic brand                                          *
	 * -------------------------------------------------------------------- *
	 *   • Seed   : #22D3EE											   *
	 *   • Contrast: AA compliant against white and dark navy surfaces      *
	 * -------------------------------------------------------------------- */
	aqua: {
		primary: {
			20: '#00363E',
			40: '#006877',
			60: '#007F90',
			80: '#2FD9F4',
			90: '#A2EEFF',
			95: '#D4F7FF',
		},
		secondary: {
			20: '#3D2F00',
			40: '#745B00',
			60: '#B08C00',
			80: '#ECC239',
			90: '#FFE08B',
			95: '#FFEFCD',
		},
		tertiary: {
			20: '#342B4B',
			40: '#63597C',
			60: '#978BB0',
			80: '#CDC0E8',
			90: '#E9DDFF',
			95: '#F6EDFF',
		},
		neutral: {
			20: '#303031',
			40: '#5E5E5F',
			60: '#919091',
			80: '#C7C6C6',
			90: '#E3E2E2',
			95: '#F2F0F0',
		},
		success: {
			20: '#064E3B',
			40: '#047857',
			60: '#10B981',
			80: '#6EE7B7',
			90: '#A7F3D0',
			95: '#ECFDF5',
		},
		warning: {
			20: '#78350F',
			40: '#B45309',
			60: '#F59E0B',
			80: '#FCD34D',
			90: '#FDE68A',
			95: '#FEF3C7',
		},
		error: {
			20: '#881337',
			40: '#BE123C',
			60: '#E11D48',
			80: '#FB7185',
			90: '#FDA4AF',
			95: '#FFE4E6',
		},
	},

	/* -------------------------------------------------------------------- *
	 * BLOSSOM ‒ soft, blossom-inspired brand                               *
	 * -------------------------------------------------------------------- *
	 *   • Seed   : #FFB7C5                                               *
	 *   • Contrast: AA compliant against white and dark navy surfaces      *
	 * -------------------------------------------------------------------- */
	blossom: {
		primary: {
			20: '#50212D',
			40: '#864E5A',
			60: '#AA5566',
			80: '#FBB3C1',
			90: '#FFD9DF',
			95: '#FFECEE',
		},
		secondary: {
			20: '#690003',
			40: '#BA1B17',
			60: '#FF5545',
			80: '#FFB4AA',
			90: '#FFDAD5',
			95: '#FFEDEA',
		},
		tertiary: {
			20: '#00363B',
			40: '#006970',
			60: '#469DA5',
			80: '#7FD4DC',
			90: '#9BF0F9',
			95: '#C7FAFF',
		},
		neutral: {
			20: '#313030',
			40: '#605E5E',
			60: '#939090',
			80: '#C9C6C6',
			90: '#E6E1E1',
			95: '#F4F0F0',
		},
		success: {
			20: '#14532D',
			40: '#15803D',
			60: '#22C55E',
			80: '#86EFAC',
			90: '#BBF7D0',
			95: '#ECFDF5',
		},
		warning: {
			20: '#78350F',
			40: '#B45309',
			60: '#F59E0B',
			80: '#FCD34D',
			90: '#FDE68A',
			95: '#FEF3C7',
		},
		error: {
			20: '#7F1D1D',
			40: '#B91C1C',
			60: '#DC2626',
			80: '#F87171',
			90: '#FCA5A5',
			95: '#FEE2E2',
		},
	},

	/* -------------------------------------------------------------------- *
	 * GRAPHITE ‒ refined, charcoal brand                                   *
	 * -------------------------------------------------------------------- *
	 *   • Seed   : #2B2F36                                               *
	 *   • Contrast: AA compliant against white and dark navy surfaces      *
	 * -------------------------------------------------------------------- */
	graphite: {
		primary: {
			20: '#2D3138',
			40: '#5B5E66',
			60: '#6A7078',
			80: '#C3C6CF',
			90: '#DFE2EC',
			95: '#EEF0FA',
		},
		secondary: {
			20: '#68000C',
			40: '#B2292D',
			60: '#F75C59',
			80: '#FFB3AE',
			90: '#FFDAD7',
			95: '#FFEDEB',
		},
		tertiary: {
			20: '#462A12',
			40: '#7A573C',
			60: '#B2886A',
			80: '#ECBD9C',
			90: '#FFDCC4',
			95: '#FFEDE3',
		},
		neutral: {
			20: '#313030',
			40: '#5F5E5E',
			60: '#929090',
			80: '#C9C6C6',
			90: '#E5E2E1',
			95: '#F3F0F0',
		},
		success: {
			20: '#14532D',
			40: '#166534',
			60: '#16A34A',
			80: '#86EFAC',
			90: '#BBF7D0',
			95: '#ECFDF5',
		},
		warning: {
			20: '#78350F',
			40: '#B45309',
			60: '#F59E0B',
			80: '#FCD34D',
			90: '#FDE68A',
			95: '#FEF3C7',
		},
		error: {
			20: '#7F1D1D',
			40: '#991B1B',
			60: '#B91C1C',
			80: '#F87171',
			90: '#FCA5A5',
			95: '#FEE2E2',
		},
	},

	/* -------------------------------------------------------------------- *
	 * SUNSET ‒ warm, sunset-orange brand                                   *
	 * -------------------------------------------------------------------- *
	 *   • Seed   : #F97316                                               *
	 *   • Contrast: AA compliant against white and dark navy surfaces      *
	 * -------------------------------------------------------------------- */
	sunset: {
		primary: {
			20: '#552100',
			40: '#9D4300',
			60: '#BF5605',
			80: '#FFB690',
			90: '#FFDBCA',
			95: '#FFEDE6',
		},
		secondary: {
			20: '#690000',
			40: '#C00100',
			60: '#FF5540',
			80: '#FFB4A8',
			90: '#FFDAD4',
			95: '#FFEDEA',
		},
		tertiary: {
			20: '#00344B',
			40: '#00658C',
			60: '#3F99C9',
			80: '#81CFFF',
			90: '#C6E7FF',
			95: '#E4F3FF',
		},
		neutral: {
			20: '#303032',
			40: '#5E5E60',
			60: '#919093',
			80: '#C7C6C8',
			90: '#E4E2E4',
			95: '#F2F0F2',
		},
		success: {
			20: '#365314',
			40: '#4D7C0F',
			60: '#65A30D',
			80: '#A3E635',
			90: '#D9F99D',
			95: '#ECFCCB',
		},
		warning: {
			20: '#7C2D12',
			40: '#A16207',
			60: '#EAB308',
			80: '#FDE047',
			90: '#FEF08A',
			95: '#FEF9C3',
		},
		error: {
			20: '#7A1A1A',
			40: '#B71C1C',
			60: '#D32F2F',
			80: '#E57373',
			90: '#FFCDD2',
			95: '#FFEBEE',
		},
	},

	/* -------------------------------------------------------------------- *
	 * MINT ‒ fresh, mint-teal brand                                        *
	 * -------------------------------------------------------------------- *
	 *   • Seed   : #2DD4BF                                               *
	 *   • Contrast: AA compliant against white and dark navy surfaces      *
	 * -------------------------------------------------------------------- */
	mint: {
		primary: {
			20: '#003731',
			40: '#006B5F',
			60: '#007F90',
			80: '#3CDDC7',
			90: '#62FAE3',
			95: '#B5FFF1',
		},
		secondary: {
			20: '#2E3131',
			40: '#5C5F5E',
			60: '#8F9190',
			80: '#C5C7C6',
			90: '#E1E3E2',
			95: '#F0F1F0',
		},
		tertiary: {
			20: '#650031',
			40: '#B21E5F',
			60: '#F65591',
			80: '#FFB1C6',
			90: '#FFD9E1',
			95: '#FFECEF',
		},
		neutral: {
			20: '#2E3130',
			40: '#5D5F5E',
			60: '#8F9190',
			80: '#C5C7C5',
			90: '#E2E3E1',
			95: '#F0F1EF',
		},
		success: {
			20: '#064E3B',
			40: '#047857',
			60: '#10B981',
			80: '#6EE7B7',
			90: '#A7F3D0',
			95: '#ECFDF5',
		},
		warning: {
			20: '#7C2D12',
			40: '#A16207',
			60: '#EAB308',
			80: '#FDE047',
			90: '#FEF08A',
			95: '#FEF9C3',
		},
		error: {
			20: '#7A1A1A',
			40: '#B71C1C',
			60: '#D32F2F',
			80: '#E57373',
			90: '#FFCDD2',
			95: '#FFEBEE',
		},
	},
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
