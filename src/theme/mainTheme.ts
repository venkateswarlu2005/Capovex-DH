'use client';

import { createTheme } from '@mui/material';
import { Theme } from '@mui/material/styles';

import {
	makeAlpha,
	alert as neutralAlert,
	background as neutralBackground,
	border as neutralBorder,
	disabled as neutralDisabled,
	hover as neutralHover,
	text as neutralText,
} from './branding/data/baseColors';

import neutralTheme from './globalTheme';

/* -------------------------------------------------------------------------- */
/* 1 · Brand palette values (CAPOVEX)                                         */
/* -------------------------------------------------------------------------- */

const CAPOVEX_ORANGE = '#ED7D22'; // primary / info
const CAPOVEX_ORANGE_HOVER = '#D66F1E';
const CAPOVEX_MENU_SHADOW = '0px 12px 16px -4px rgba(16,24,40,0.08)';

/* Clone neutral tokens and overwrite vivid keys */
const text = { ...neutralText, brand: CAPOVEX_ORANGE, notes: '#A1AFC6' };

const background = {
	...neutralBackground,
	primary: CAPOVEX_ORANGE,
	content: '#FCFCFD',
	alt: '#C1CEE0',
	secondaryButton: '#E2E8F0',
};

const hover = {
	...neutralHover,
	primary: CAPOVEX_ORANGE_HOVER,
	tertiary: '#ED7D220A',
	secondary: '#E4EBF5F0',
	alt: '#EDEFF25F',
};

const alert = {
	...neutralAlert,
	info: CAPOVEX_ORANGE,
	infoLight: '#FFF4EB',
};

const disabled = {
	...neutralDisabled,
	primary: '#F1B37A',
	error: '#F5AAA6',
};

/* -------------------------------------------------------------------------- */
/* 2 · Theme merge                                                            */
/* -------------------------------------------------------------------------- */

const mainTheme = createTheme(neutralTheme, {
	palette: {
		primary: { main: CAPOVEX_ORANGE },
		secondary: { main: background.secondary },
		info: { main: CAPOVEX_ORANGE },
		text,
		background,
		action: {
			disabledBackground: disabled.secondary,
			hover: hover.tertiary,
			selected: makeAlpha(CAPOVEX_ORANGE, 0.12),
		},
	},

	/* expose vivid token objects */
	text,
	background,
	hover,
	alert,
	border: neutralBorder,

	components: {
		/* ---------------------------------------------------------------------- */
		/* Buttons                                                                */
		/* ---------------------------------------------------------------------- */
		MuiButton: {
			styleOverrides: {
				containedPrimary: ({ theme }: { theme: Theme }) => ({
					backgroundColor: theme.palette.primary.main,
					color: theme.palette.common.white,
					border: `1px solid ${theme.palette.primary.main}`,
					'&:hover': {
						backgroundColor: CAPOVEX_ORANGE_HOVER,
						borderColor: CAPOVEX_ORANGE_HOVER,
					},
					'&.Mui-disabled': {
						backgroundColor: disabled.primary,
						borderColor: disabled.primary,
						color: theme.palette.common.white,
					},
				}),

				containedSecondary: ({ theme }: { theme: Theme }) => ({
					backgroundColor: theme.palette.background.secondary,
					color: theme.palette.text.secondary,
					border: `1px solid ${neutralBorder.light}`,
					'&:hover': {
						backgroundColor: hover.tertiary,
						borderColor: hover.tertiary,
					},
					'&.Mui-disabled': {
						backgroundColor: disabled.secondary,
						color: text.notes,
						borderColor: disabled.secondary,
					},
				}),

				containedError: ({ theme }: { theme: Theme }) => ({
					backgroundColor: theme.palette.error.main,
					color: theme.palette.common.white,
					border: `1px solid ${theme.palette.error.main}`,
					'&:hover': {
						backgroundColor: hover.error,
						borderColor: hover.error,
					},
					'&.Mui-disabled': {
						backgroundColor: disabled.error,
						borderColor: disabled.error,
						color: theme.palette.common.white,
					},
				}),

				outlinedSecondary: ({ theme }: { theme: Theme }) => ({
					color: theme.palette.text.secondary,
					backgroundColor: theme.palette.background.fill ?? theme.palette.common.white,
					border: `1px solid ${neutralBorder.light}`,
					'&:hover': {
						backgroundColor: theme.palette.background.secondary,
					},
					'&.Mui-disabled': {
						backgroundColor: disabled.secondary,
						color: text.notes,
						borderColor: disabled.secondary,
					},
				}),

				textSecondary: ({ theme }: { theme: Theme }) => ({
					color: theme.palette.text.primary,
					backgroundColor: 'transparent',
					'&:hover': {
						backgroundColor: hover.tertiary,
					},
					'&.Mui-disabled': {
						backgroundColor: disabled.secondary,
						color: text.notes,
						borderColor: disabled.secondary,
					},
				}),
			},
		},

		/* ---------------------------------------------------------------------- */
		/* Chip                                                                   */
		/* ---------------------------------------------------------------------- */
		MuiChip: {
			styleOverrides: {
				colorSecondary: ({ theme }: { theme: Theme }) => ({
					backgroundColor: theme.palette.background.secondary,
					color: theme.palette.text.primary,
					border: `1.5px solid ${theme.border.light}`,
					'& .MuiChip-icon': {
						color: theme.palette.text.notes,
						marginRight: 2,
					},
				}),
			},
		},

		/* ---------------------------------------------------------------------- */
		/* Menu                                                                   */
		/* ---------------------------------------------------------------------- */
		MuiMenu: {
			styleOverrides: {
				paper: {
					boxShadow: CAPOVEX_MENU_SHADOW,
					'& .MuiMenu-list li.Mui-selected': {
						color: '#FFFFFF',
						backgroundColor: CAPOVEX_ORANGE,
					},
				},
			},
		},

		MuiMenuItem: {
			styleOverrides: {
				root: ({ theme }: { theme: Theme }) => ({
					backgroundColor: 'inherit',
					color: theme.palette.text.secondary,
					minWidth: 100,
					'&:hover': {
						backgroundColor: `${hover.tertiary} !important`,
					},
					'&.Mui-selected:hover': {
						backgroundColor: `${hover.primary} !important`,
					},
					[theme.breakpoints.up('sm')]: { fontSize: '0.7rem' },
					[theme.breakpoints.up('md')]: { fontSize: '0.75rem' },
					[theme.breakpoints.up('lg')]: { fontSize: '0.8rem' },
				}),
			},
		},

		/* ---------------------------------------------------------------------- */
		/* Pagination                                                             */
		/* ---------------------------------------------------------------------- */
		MuiPaginationItem: {
			styleOverrides: {
				root: ({ theme }: { theme: Theme }) => ({
					'&.Mui-selected': {
						backgroundColor: theme.palette.background.alt,
						color: theme.palette.text.primary,
						'&:hover': {
							backgroundColor: theme.palette.background.alt,
						},
					},
					'&:hover': {
						backgroundColor: hover.secondary,
					},
				}),
			},
		},
	},
});

export default mainTheme;
