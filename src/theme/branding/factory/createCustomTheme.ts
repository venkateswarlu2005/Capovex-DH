/* -------------------------------------------------------------------------- *
 * createCustomTheme.ts  –  build a vivid brand theme from a single HEX seed  *
 * -------------------------------------------------------------------------- *
 * Depends on:
 *   • @material/material-color-utilities  (Material-3 CorePalette generator)
 *   • chroma-js                           (contrast helper + alpha fallback)
 *   • src/theme/ds/baseColors.ts          (neutral design-system tokens)
 *   • src/theme/globalTheme.ts            (typography / spacing / neutral overrides)
 * -------------------------------------------------------------------------- */

import { alpha, createTheme, Theme } from '@mui/material';
import { ThemeOptions } from '@mui/material/styles';

import { argbFromHex, CorePalette } from '@material/material-color-utilities';

import globalTheme from '@/theme/globalTheme';

import {
	alert as neutralAlert,
	background as neutralBackground,
	border as neutralBorder,
	disabled as neutralDisabled,
	hover as neutralHover,
	text as neutralText,
} from '../data/baseColors';

import { chooseContrast, tone } from './helpers';

import { BgPreset } from '@/shared/config/brandingConfig';
import {
	AlertTokens,
	BackgroundTokens,
	BorderTokens,
	DisabledTokens,
	HoverTokens,
	TextTokens,
} from '@/shared/models';

/* -------------------------------------------------------------------------- */
/* Public factory                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Generates a complete MUI `Theme` from a single primary hex & background preset.
 */
export function createCustomTheme(primaryHex: string, bgPreset: BgPreset = 'plain'): Theme {
	/* 1 ▸ Material-3 Core palette (a1=primary, a2=secondary, a3=tertiary) */
	const core = CorePalette.of(argbFromHex(primaryHex));

	/* 2 ▸ Map tones into MUI colour groups */
	const primary = {
		main: tone(core.a1, 40),
		light: tone(core.a1, 90),
		dark: tone(core.a1, 20),
		contrastText: chooseContrast(tone(core.a1, 40)),
	};

	const secondary = {
		main: tone(core.a2, 40),
		light: tone(core.a2, 90),
		dark: tone(core.a2, 20),
		contrastText: chooseContrast(tone(core.a2, 40)),
	};

	/** We’ll store “tertiary” inside MUI’s `info` slot to avoid module augmentation */
	const info = {
		main: tone(core.a3, 40),
		light: tone(core.a3, 90),
		dark: tone(core.a3, 20),
		contrastText: chooseContrast(tone(core.a3, 40)),
	};

	const error = {
		main: tone(core.error, 40),
		light: tone(core.error, 90),
		dark: tone(core.error, 20),
		contrastText: chooseContrast(tone(core.error, 40)),
	};

	/* 3 ▸ Clone neutral tokens & inject vivid hues */
	const brandText: TextTokens = { ...neutralText, brand: primary.main };

	const alert: AlertTokens = { ...neutralAlert };
	const disabled: DisabledTokens = { ...neutralDisabled };
	const border: BorderTokens = { ...neutralBorder };

	const brandHover: HoverTokens = {
		...neutralHover,
		primary: alpha(primary.main, 0.08),
		tertiary: alpha(primary.main, 0.04),
		alt: alpha(primary.main, 0.05),
	};

	/* 4 ▸ Background tokens (new mutable object) */
	let brandBg: BackgroundTokens = { ...neutralBackground, paper: neutralBackground.alt };

	/* Page background for MUI (separate from DS tokens) */
	let pageBg: string = (neutralBackground as any).default ?? '#fff';

	if (bgPreset === 'soft') {
		brandBg = {
			...brandBg,
			content: alpha(primary.main, 0.03),
			paper: alpha(primary.main, 0.03),
		};
		pageBg = alpha(primary.main, 0.03);
	} else if (bgPreset === 'dark') {
		brandBg = {
			...brandBg,
			content: tone(core.n1, 20),
			paper: tone(core.n1, 30),
		};
		pageBg = tone(core.n1, 10);
	}

	/* 5 ▸ Disabled tokens (mode-aware) */
	const isDark = bgPreset === 'dark';
	const actionDisabled = isDark ? alpha('#fff', 0.38) : alpha('#000', 0.38);
	const actionDisabledBg = isDark ? alpha('#fff', 0.12) : alpha(primary.main, 0.12);

	/* 6 ▸ MUI text palette (mode-aware) – used by Typography, inputs, etc. */
	const muiText = isDark
		? {
				primary: alpha('#fff', 0.92),
				secondary: alpha('#fff', 0.7),
				disabled: alpha('#fff', 0.5),
			}
		: {
				primary: 'rgba(0,0,0,0.87)',
				secondary: 'rgba(0,0,0,0.60)',
				disabled: 'rgba(0,0,0,0.38)',
			};

	/* 7 ▸ Assemble brand-specific overrides */
	const brandOverrides: ThemeOptions = {
		palette: {
			mode: isDark ? 'dark' : 'light',
			primary,
			secondary,
			info,
			error,
			background: {
				default: pageBg, // ⟵ use the computed page background
				paper: brandBg.paper, // ⟵ surface background
			},
			text: muiText,
			action: {
				hover: brandHover.primary,
				selected: alpha(primary.main, 0.12),
				disabled: actionDisabled,
				disabledBackground: actionDisabledBg,
			},
		},
		text: brandText,
		background: brandBg,
		hover: brandHover,
		alert,
		border,
		disabled,

		components: {
			/* Page background via CssBaseline (soft/dark) */
			MuiCssBaseline: {
				styleOverrides: (theme) => ({
					'html, body, #__next': { height: '100%' },
					body: {
						backgroundColor: theme.palette.background.default,
						backgroundImage: 'none',
					},
				}),
			},

			/* Skeleton shimmer tinted to brand colour */
			MuiSkeleton: {
				styleOverrides: {
					root: ({ theme }) => ({
						backgroundColor: alpha(theme.palette.primary.main, 0.15),
					}),
				},
			},

			/* Accessible focus ring */
			MuiButtonBase: {
				styleOverrides: {
					root: ({ theme }) => ({
						'&:focus-visible': {
							outline: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
							outlineOffset: 2,
						},
					}),
				},
			},

			/* Button disabled states – brand-aware & accessible */
			MuiButton: {
				styleOverrides: {
					containedPrimary: {
						'&.Mui-disabled': {
							backgroundColor: isDark ? alpha('#fff', 0.18) : alpha(primary.main, 0.26),
							color: '#fff',
							boxShadow: 'none',
						},
					},
					outlinedPrimary: {
						'&.Mui-disabled': {
							borderColor: actionDisabled,
							color: actionDisabled,
						},
					},
				},
			},

			/* Switch thumb & track */
			MuiSwitch: {
				styleOverrides: {
					switchBase: ({ theme }) => ({
						'&.Mui-checked': {
							color: theme.palette.primary.main,
							'& + .MuiSwitch-track': {
								backgroundColor: alpha(theme.palette.primary.main, 0.6),
							},
						},
					}),
				},
			},

			/* Accordion hover / expanded tint */
			MuiAccordionSummary: {
				styleOverrides: {
					root: ({ theme }) => ({
						'&:hover': {
							backgroundColor: alpha(theme.palette.primary.main, 0.08),
						},
						'&.Mui-expanded': {
							backgroundColor: alpha(theme.palette.primary.main, 0.12),
						},
					}),
				},
			},

			/* Typography in dark */
			MuiTypography: {
				styleOverrides: isDark
					? {
							root: {
								color: alpha('#fff', 0.92), // default text
								'&.MuiTypography-colorPrimary': { color: alpha('#fff', 0.92) },
								'&.MuiTypography-colorSecondary': { color: alpha('#fff', 0.7) },
								'&.MuiTypography-colorTextSecondary': { color: alpha('#fff', 0.7) },
							},
						}
					: {},
			},

			/* Dialog surface */
			MuiDialog: {
				styleOverrides: {
					paper: ({ theme }) => ({
						backgroundColor: isDark
							? theme.palette.background.paper
							: theme.palette.background.content,
						backgroundImage: 'none',
					}),
				},
			},

			/* Dialog texts in dark */
			MuiDialogTitle: {
				styleOverrides: {
					root: { color: isDark ? alpha('#fff', 0.92) : undefined },
				},
			},
			MuiDialogContentText: {
				styleOverrides: {
					root: { color: isDark ? alpha('#fff', 0.7) : undefined },
				},
			},

			/* Form labels – catch both InputLabel and its base FormLabel (handles color="primary") */
			MuiFormLabel: {
				styleOverrides: {
					root: {
						color: isDark ? alpha('#fff', 0.7) : undefined,
						'&.Mui-focused': { color: isDark ? '#fff' : undefined },
						'&.Mui-disabled': { color: isDark ? alpha('#fff', 0.5) : undefined },
						'&.MuiFormLabel-colorPrimary': { color: isDark ? alpha('#fff', 0.7) : undefined },
					},
				},
			},
			MuiInputLabel: {
				styleOverrides: {
					root: {
						color: isDark ? alpha('#fff', 0.7) : undefined,
						'&.Mui-focused': { color: isDark ? '#fff' : undefined },
						'&.Mui-disabled': { color: isDark ? alpha('#fff', 0.5) : undefined },
					},
				},
			},

			/* Form helper/error text – light in dark mode */
			MuiFormHelperText: {
				styleOverrides: {
					root: ({ theme }) => ({
						color: isDark ? alpha('#fff', 0.7) : undefined,
						'&.Mui-error': {
							color: isDark ? alpha(error.light, 0.9) : error.main,
						},
					}),
				},
			},

			/* Outlined input – dark background + proper borders + placeholder/autofill */
			MuiOutlinedInput: {
				styleOverrides: {
					root: {
						// subtle dark surface behind the field
						backgroundColor: isDark ? alpha('#fff', 0.06) : undefined,
						'&:hover': { backgroundColor: isDark ? alpha('#fff', 0.08) : undefined },
						'&.Mui-focused': { backgroundColor: isDark ? alpha('#fff', 0.1) : undefined },
						'&.Mui-disabled': { backgroundColor: isDark ? alpha('#fff', 0.04) : undefined },
						// outline color
						'& .MuiOutlinedInput-notchedOutline': {
							borderColor: isDark ? alpha('#fff', 0.24) : undefined,
						},
					},
					input: {
						// ensure the actual <input> doesn’t paint white
						backgroundColor: 'transparent',
						color: isDark ? alpha('#fff', 0.92) : undefined,
						'&::placeholder': { color: isDark ? alpha('#fff', 0.5) : undefined, opacity: 1 },
						// Chrome autofill fix (otherwise it can flash a white bg)
						'&:-webkit-autofill': {
							WebkitTextFillColor: isDark ? '#fff' : undefined,
							WebkitBoxShadow: isDark ? `0 0 0 1000px ${alpha('#fff', 0.06)} inset` : undefined,
							transition: 'background-color 9999s ease-out 0s',
						},
					},
				},
			},

			/* Safety net for any input variant that might be setting white bg */
			MuiInputBase: {
				styleOverrides: {
					input: { backgroundColor: 'transparent' },
				},
			},

			/*  Avatar bgPreset */
			MuiAvatar: {
				styleOverrides: {
					root: ({ theme }) => ({
						color: '#fff',
						backgroundColor: theme.palette.primary.main,
					}),
				},
			},
		},
	};

	/* 8 ▸ Merge with neutral foundation and return */
	return createTheme(globalTheme, brandOverrides);
}
