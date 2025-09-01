/**
 * Branding constants – revamped to match the new theme system.
 * Friendly preset names + simplified background enum.
 */

export const THEME_PRESETS = [
	'lavender',
	'midnight',
	'aqua',
	'blossom',
	'graphite',
	'sunset',
	'mint',
] as const;
export type ThemePreset = (typeof THEME_PRESETS)[number];

export const BG_PRESETS = ['plain', 'soft', 'dark'] as const;
export type BgPreset = (typeof BG_PRESETS)[number];
