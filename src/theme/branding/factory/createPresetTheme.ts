/* -------------------------------------------------------------------------- *
 *  createPresetTheme.ts – turn a BrandPalette preset into a full MUI theme   *
 * -------------------------------------------------------------------------- */

import { alpha, createTheme, Theme } from '@mui/material';
import { ThemeOptions } from '@mui/material/styles';

import globalTheme from '@/theme/globalTheme';

import {
	alert as neutralAlert,
	background as neutralBackground,
	border as neutralBorder,
	disabled as neutralDisabled,
	hover as neutralHover,
	text as neutralText,
} from '../data/baseColors';
import { presetPaletteMap } from '../data/presetPaletteMap';

import { rampToMui } from './helpers';

import { ThemePreset } from '@/shared/config/brandingConfig';
import {
	AlertTokens,
	BackgroundTokens,
	BorderTokens,
	DisabledTokens,
	HoverTokens,
	TextTokens,
} from '@/shared/models';

/* -------------------------------------------------------------------------- */
/* factory                                                                    */
/* -------------------------------------------------------------------------- */

export function createPresetTheme(preset: ThemePreset): Theme {
	const p = presetPaletteMap[preset];

	/* palette groups ----------------------------------------------------- */
	const primary = rampToMui(p.primary);
	const secondary = rampToMui(p.secondary);
	const info = rampToMui(p.tertiary);
	const error = rampToMui(p.error);
	const success = rampToMui(p.success);
	const warning = rampToMui(p.warning);

	/* derived tokens ------------------------------------------------------ */
	const text: TextTokens = { ...neutralText, brand: primary.main };
	const alert: AlertTokens = { ...neutralAlert };
	const disabled: DisabledTokens = { ...neutralDisabled };
	const border: BorderTokens = { ...neutralBorder };

	const hover: HoverTokens = {
		...neutralHover,
		primary: alpha(primary.main, 0.08),
		tertiary: alpha(primary.main, 0.04),
		alt: alpha(primary.main, 0.05),
	};

	const background: BackgroundTokens = {
		...neutralBackground,
		content: p.neutral[95],
		paper: '#FFFFFF',
	};

	/* theme merge --------------------------------------------------------- */
	const overrides: ThemeOptions = {
		palette: {
			mode: 'light',
			primary,
			secondary,
			info,
			error,
			success,
			warning,
			text,
			background,
			action: {
				hover: hover.primary,
				selected: alpha(primary.main, 0.12),
				disabled: disabled.primary,
				disabledBackground: disabled.secondary,
			},
		},
		text,
		background,
		hover,
		alert,
		border,
		disabled,
	};

	return createTheme(globalTheme, overrides);
}
