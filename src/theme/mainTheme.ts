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
/* 1 · Brand palette values                                                   */
/* -------------------------------------------------------------------------- */

const BW_BLUE = '#1570EF'; // primary / info
const BW_BLUE_HOVER = '#175CD3';
const BW_MENU_SHADOW = '0px 12px 16px -4px rgba(16,24,40,0.08)';

/* Clone neutral tokens and overwrite vivid keys */
const text = { ...neutralText, brand: BW_BLUE, notes: '#A1AFC6' };

const background = {
	...neutralBackground,
	primary: BW_BLUE,
	content: '#fcfcfd',
	alt: '#c1cee0',
	secondaryButton: '#e2e8f0',
};
const hover = {
	...neutralHover,
	primary: BW_BLUE_HOVER,
	tertiary: '#1570ef0a',
	secondary: '#e4ebf5f0',
	alt: '#edeff25f',
};

const alert = { ...neutralAlert, info: BW_BLUE, infoLight: '#F5F9FF' };

const disabled = {
	...neutralDisabled,
	primary: '#a6cbff',
	error: '#f5aaa6',
};

/* -------------------------------------------------------------------------- */
/* 2 · Theme merge                                                            */
/* -------------------------------------------------------------------------- */

const mainTheme = createTheme(neutralTheme, {
	palette: {
		primary: { main: BW_BLUE },
		secondary: { main: background.secondary },
		info: { main: BW_BLUE },
		text,
		background,
		action: {
			disabledBackground: disabled.secondary,
			hover: hover.tertiary,
			selected: makeAlpha(BW_BLUE, 0.12),
		},
	},
	/* expose vivid token objects for brand creators */
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
					'&:hover': { backgroundColor: BW_BLUE_HOVER, borderColor: BW_BLUE_HOVER },
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
					'&:hover': { backgroundColor: hover.tertiary, borderColor: hover.tertiary },
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
					'&:hover': { backgroundColor: hover.error, borderColor: hover.error },
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
					'&:hover': { backgroundColor: theme.palette.background.secondary },
					'&.Mui-disabled': {
						backgroundColor: disabled.secondary,
						color: text.notes,
						borderColor: disabled.secondary,
					},
				}),
				textSecondary: ({ theme }: { theme: Theme }) => ({
					color: theme.palette.text.primary,
					backgroundColor: 'transparent',
					'&:hover': { backgroundColor: hover.tertiary },
					'&.Mui-disabled': {
						backgroundColor: disabled.secondary,
						color: text.notes,
						borderColor: disabled.secondary,
					},
				}),
			},
		},

		/* ---------------------------------------------------------------------- */
		/* Chip – vivid border                                                    */
		/* ---------------------------------------------------------------------- */
		MuiChip: {
			styleOverrides: {
				colorSecondary: ({ theme }: { theme: Theme }) => ({
					backgroundColor: theme.palette.background.secondary,
					color: theme.palette.text.primary,
					border: `1.5px solid ${theme.border.light}`,
					'& .MuiChip-icon': { color: theme.palette.text.notes, marginRight: 2 },
				}),
			},
		},

		/* ---------------------------------------------------------------------- */
		/* Menu – selected state uses primary blue                                */
		/* ---------------------------------------------------------------------- */
		MuiMenu: {
			styleOverrides: {
				paper: {
					boxShadow: BW_MENU_SHADOW,
					'& .MuiMenu-list li.Mui-selected': {
						color: neutralTheme.palette.common.white,
						backgroundColor: BW_BLUE,
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
					'&:hover': { backgroundColor: `${hover.tertiary} !important` },
					'&.Mui-selected:hover': { backgroundColor: `${hover.primary} !important` },
					[theme.breakpoints.up('sm')]: { fontSize: '0.7rem' },
					[theme.breakpoints.up('md')]: { fontSize: '0.75rem' },
					[theme.breakpoints.up('lg')]: { fontSize: '0.8rem' },
				}),
			},
		},

		/* ---------------------------------------------------------------------- */
		/* Pagination selected dot                                                */
		/* ---------------------------------------------------------------------- */
		MuiPaginationItem: {
			styleOverrides: {
				root: ({ theme }: { theme: Theme }) => ({
					'&.Mui-selected': {
						backgroundColor: theme.palette.background.alt,
						color: theme.palette.text.primary,
						'&:hover': { backgroundColor: theme.palette.background.alt },
					},
					'&:hover': { backgroundColor: hover.secondary },
				}),
			},
		},

		/* Additional vivid overrides can be added here as needed … */
	},
});

export default mainTheme;
