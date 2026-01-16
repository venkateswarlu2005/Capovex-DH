/* --------------------------------------------------------------------------- *
 *  Design-system colour primitives (neutral layer)
 *  -------------------------------------------------------------------------- *
 * -------------------------------------------------------------------------- */

import {
	AlertTokens,
	BackgroundTokens,
	BorderTokens,
	DisabledTokens,
	HoverTokens,
	TextTokens,
} from '@/shared/models';
import { alpha } from '@mui/material';

/** Neutral greys & semantic colours */
export const neutral = {
	/* greys */
	white: '#FFFFFF',
	gray50: '#F6F6F6',
	gray100: '#F2F4F7',
	gray200: '#EAECF0',
	gray300: '#D0D5DD',
	gray400: '#98A2B3',
	gray500: '#667085',
	gray600: '#475467',
	gray700: '#344054',
	gray800: '#1D2939',
	gray900: '#101828',

	/* semantic primaries */
	error: '#DB504A',
	warning: '#FEC84B',
	success: '#418944',
} as const;

/** Convenience wrapper around MUI alpha */
export const makeAlpha = (hex: string, opacity: number) => alpha(hex, opacity);

/* ---------------------------------------------------------------------------
 * Legacy colour objects – preserved names, neutral fall-backs
 * ------------------------------------------------------------------------ */

export const text: Readonly<TextTokens> = {
	primary: neutral.gray700,
	secondary: neutral.gray600,
	tertiary: neutral.white,
	notes: neutral.gray400,
	brand: neutral.gray700, // overridden to brand hue later
	error: '#FF4747', // keep distinct semantic red
} as const;

export const background: Readonly<BackgroundTokens> = {
	content: neutral.white,
	alt: neutral.gray100,
	primary: neutral.white, // overridden to brand hue later
	fill: neutral.white,
	error: neutral.error,
	secondary: neutral.gray50,
	secondaryButton: neutral.gray100,
	paper: neutral.white,
} as const;

export const disabled: Readonly<DisabledTokens> = {
	primary: neutral.gray200,
	secondary: neutral.gray100,
	error: makeAlpha(neutral.error, 0.3),
} as const;

export const hover: Readonly<HoverTokens> = {
	primary: makeAlpha(neutral.gray700, 0.08), // overridden later
	secondary: makeAlpha(neutral.gray600, 0.06),
	tertiary: makeAlpha(neutral.gray700, 0.04),
	alt: makeAlpha(neutral.gray700, 0.05),
	error: makeAlpha(neutral.error, 0.9),
} as const;

export const alert: Readonly<AlertTokens> = {
	info: neutral.gray700, // neutral core “info”
	infoLight: neutral.gray50,
	warning: neutral.warning,
	warningLight: makeAlpha(neutral.warning, 0.15),
	error: neutral.error,
	errorLight: makeAlpha(neutral.error, 0.1),
	success: neutral.success,
	successLight: makeAlpha(neutral.success, 0.12),
	default: neutral.white,
} as const;

export const border: Readonly<BorderTokens> = {
	light: neutral.gray200,
	dark: neutral.gray300,
} as const;
