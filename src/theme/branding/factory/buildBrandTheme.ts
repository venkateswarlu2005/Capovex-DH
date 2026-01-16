/* -------------------------------------------------------------------------- *
 * buildBrandTheme.ts – single entry-point for “brand” themes (SSR + CSR)    *
 * -------------------------------------------------------------------------- *
 * Receives the persisted branding settings for a tenant / link and returns   *
 * a fully-baked MUI Theme ready for <ThemeProvider>.                         *
 * -------------------------------------------------------------------------- */

import { Theme } from '@mui/material';

import { createCustomTheme } from './createCustomTheme';
import { createPresetTheme } from './createPresetTheme';
import { isThemePreset } from './helpers';

import { BgPreset, ThemePreset } from '@/shared/config/brandingConfig';

/* -------------------------------------------------------------------------- */
/* External domain model (kept minimal here to avoid circular deps)           */
/* -------------------------------------------------------------------------- */
export interface BrandingSettings {
	/** HEX string like “#1570EF” when the user picked a custom colour. */
	primaryColor?: string | null;
	/** One of THEME_PRESETS or null.  Null ⇒ use primaryColor flow.    */
	themePreset?: ThemePreset | null;
	/** 'plain' | 'soft' | 'dark'                                         */
	bgPreset?: BgPreset;
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

export const DEFAULT_PRIMARY_HEX = '#1570EF';

export function buildBrandTheme(settings: BrandingSettings): Theme {
	const { themePreset, primaryColor, bgPreset = 'plain' } = settings;

	if (themePreset && isThemePreset(themePreset)) {
		return createPresetTheme(themePreset);
	}

	// fallback to single-hex flow (or default Bluewave blue)
	return createCustomTheme(primaryColor ?? DEFAULT_PRIMARY_HEX, bgPreset);
}

/* Convenience re-export so consumers can `import { buildBrandTheme }` only. */
export type BrandTheme = ReturnType<typeof buildBrandTheme>;
