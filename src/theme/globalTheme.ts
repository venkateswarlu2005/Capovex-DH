'use client';

import { createTheme } from '@mui/material';
import { PaletteOptions } from '@mui/material/styles';

import {
	alert,
	background,
	border,
	disabled,
	hover,
	makeAlpha,
	neutral,
	text,
} from './branding/data/baseColors';

/* -------------------------------------------------------------------------- */
/* Spacing, Palette, action, shape, shadows                                   */
/* -------------------------------------------------------------------------- */
const baseTheme = createTheme({
	spacing: (factor: number) => `${0.125 * factor}rem`,
	palette: {
		mode: 'light',
		primary: { main: background.primary },
		secondary: { main: background.secondary },
		error: { main: background.error, contrastText: text.tertiary },
		text: text,
		background: background as unknown as PaletteOptions['background'],

		action: {
			hover: hover.primary,
			selected: makeAlpha(neutral.gray700, 0.12),
			disabled: disabled.primary,
			disabledBackground: disabled.secondary,
		},
	},
	shape: {
		borderRadius: 2,
	},
	border: { light: border.light, dark: border.dark },
});

baseTheme.shadows[24] = '0px 10px 15px -3px rgba(0,0,0,0.1),0px 4px 6px -2px rgba(0,0,0,0.05)';

/* -------------------------------------------------------------------------- */
/* Typography                                                                */
/* -------------------------------------------------------------------------- */

baseTheme.typography = {
	...baseTheme.typography,
	fontFamily: '"Inter","system-ui","Avenir","Helvetica","Arial",sans-serif',
	fontSize: 13,
	allVariants: { lineHeight: 1.35 }, // unitless line height

	h1: {
		color: text.brand,
		fontWeight: 600,
		[baseTheme.breakpoints.up('sm')]: { fontSize: '1rem' },
		[baseTheme.breakpoints.up('md')]: { fontSize: '1.08rem' },
		[baseTheme.breakpoints.up('lg')]: { fontSize: '1.25rem' },
	},
	h2: {
		color: text.primary,
		fontWeight: 600,
		[baseTheme.breakpoints.up('sm')]: { fontSize: '0.8rem' },
		[baseTheme.breakpoints.up('md')]: { fontSize: '0.9rem' },
		[baseTheme.breakpoints.up('lg')]: { fontSize: '1rem' },
	},
	h3: {
		color: text.primary,
		fontWeight: 500,
		[baseTheme.breakpoints.up('sm')]: { fontSize: '0.7rem' },
		[baseTheme.breakpoints.up('md')]: { fontSize: '0.75rem' },
		[baseTheme.breakpoints.up('lg')]: { fontSize: '0.8rem' },
	},
	h4: {
		color: text.primary,
		fontWeight: 600,
		[baseTheme.breakpoints.up('sm')]: {
			fontSize: '0.7rem',
		},
		[baseTheme.breakpoints.up('md')]: {
			fontSize: '0.75rem',
		},
		[baseTheme.breakpoints.up('lg')]: {
			fontSize: '0.8rem',
		},
	}, //Custom name: description_bold
	h5: {
		color: text.primary,
		fontWeight: 600,
		[baseTheme.breakpoints.up('sm')]: {
			fontSize: '0.62rem',
		},
		[baseTheme.breakpoints.up('md')]: {
			fontSize: '0.65rem',
		},
		[baseTheme.breakpoints.up('lg')]: {
			fontSize: '0.7rem',
		},
	}, //Custom name: note_bold
	h6: {
		color: text.secondary,
		fontWeight: 400,
		[baseTheme.breakpoints.up('sm')]: {
			fontSize: '0.62rem',
		},
		[baseTheme.breakpoints.up('md')]: {
			fontSize: '0.65rem',
		},
		[baseTheme.breakpoints.up('lg')]: {
			fontSize: '0.7rem',
		},
	}, //Custom name: note_darkGray
	body1: {
		color: text.primary,
		fontWeight: 400,
		[baseTheme.breakpoints.up('sm')]: { fontSize: '0.7rem' },
		[baseTheme.breakpoints.up('md')]: { fontSize: '0.75rem' },
		[baseTheme.breakpoints.up('lg')]: { fontSize: '0.8rem' },
	},
	body2: {
		color: text.notes,
		fontWeight: 400,
		[baseTheme.breakpoints.up('sm')]: { fontSize: '0.62rem' },
		[baseTheme.breakpoints.up('md')]: { fontSize: '0.65rem' },
		[baseTheme.breakpoints.up('lg')]: { fontSize: '0.7rem' },
	},
	subtitle1: {
		color: text.notes,
		fontWeight: 400,
		[baseTheme.breakpoints.up('sm')]: { fontSize: '0.7rem' },
		[baseTheme.breakpoints.up('md')]: { fontSize: '0.75rem' },
		[baseTheme.breakpoints.up('lg')]: { fontSize: '0.8rem' },
	},
	subtitle2: {
		color: text.secondary,
		fontWeight: 400,
		[baseTheme.breakpoints.up('sm')]: { fontSize: '0.7rem' },
		[baseTheme.breakpoints.up('md')]: { fontSize: '0.75rem' },
		[baseTheme.breakpoints.up('lg')]: { fontSize: '0.8rem' },
	},
	caption: {
		color: text.notes,
		fontWeight: 400,
		lineHeight: 1.5, // changed from '20px' to unitless
		textAlign: 'left',
		[baseTheme.breakpoints.up('sm')]: { fontSize: '0.62rem' },
		[baseTheme.breakpoints.up('md')]: { fontSize: '0.65rem' },
		[baseTheme.breakpoints.up('lg')]: { fontSize: '0.7rem' },
	},
};

baseTheme.components = {
	MuiAccordion: {
		styleOverrides: {
			root: ({ theme }) => ({
				border: '0',
				boxShadow: 'none',
				margin: '10px 0',
				'&:before': { content: 'none' },
			}),
		},
	},
	MuiAccordionSummary: {
		styleOverrides: {
			root: ({ theme }) => ({
				backgroundColor: theme.palette.background.secondary, // neutral light-grey
				borderRadius: '2px',
				maxWidth: 150,
				minHeight: '0 !important',
				'& .MuiAccordionSummary-content': {
					margin: '0 !important',
				},
			}),
		},
	},
	MuiButton: {
		styleOverrides: {
			root: ({ theme }) => ({
				fontWeight: 400,
				borderRadius: 4,
				boxShadow: 'none',
				textTransform: 'none',
				'&:focus': { outline: 'none' },
				'&:hover': { boxShadow: 'none' },
				[theme.breakpoints.up('sm')]: { fontSize: '0.7rem', minWidth: '6rem' },
				[theme.breakpoints.up('md')]: { fontSize: '0.75rem', minWidth: '7.5rem' },
				[theme.breakpoints.up('lg')]: { fontSize: '0.8rem', minWidth: '9rem' },
			}),
			sizeLarge: ({ theme }) => ({
				[theme.breakpoints.up('sm')]: { padding: '0.2rem 0.8rem', fontSize: '0.75rem' },
				[theme.breakpoints.up('md')]: { padding: '0.3rem 1rem', fontSize: '0.8rem' },
				[theme.breakpoints.up('lg')]: { padding: '0.4rem 1.5rem', fontSize: '1rem' },
			}),
			sizeMedium: ({ theme }) => ({
				[theme.breakpoints.up('sm')]: { padding: '0.2rem 0.7rem' },
				[theme.breakpoints.up('md')]: { padding: '0.3rem 0.8rem' },
				[theme.breakpoints.up('lg')]: { padding: '0.4rem 1rem' },
			}),
			sizeSmall: ({ theme }) => ({
				[theme.breakpoints.up('sm')]: {
					padding: '0.1rem 0.6rem',
					minWidth: '5.5rem',
					fontSize: '0.65rem',
				},
				[theme.breakpoints.up('md')]: {
					padding: '0.2rem 0.7rem',
					minWidth: '6.5rem',
					fontSize: '0.7rem',
				},
				[theme.breakpoints.up('lg')]: {
					padding: '0.3rem 0.8rem',
					minWidth: '7rem',
					fontSize: '0.8rem',
				},
			}),
		},
		defaultProps: { disableRipple: true },
	},
	MuiChip: {
		styleOverrides: {
			colorSecondary: {
				// borderRadius: 2,
				backgroundColor: background.secondary, // grey-50
				color: text.primary,
				border: `1.5px solid ${border.light}`,
				'& .MuiChip-icon': { color: text.notes, marginRight: 2 },
			},
		},
	},
	MuiContainer: {
		styleOverrides: {
			root: ({ theme }) => ({
				paddingLeft: '0 !important',
				paddingRight: '0 !important',
			}),
		},
	},
	MuiCssBaseline: {
		styleOverrides: {
			body: {
				// lineHeight: 'inherit',
				colorScheme: 'light dark', // prepares for future dark-mode
			},
		},
	},
	MuiIconButton: {
		styleOverrides: {
			root: ({ theme }) => ({
				padding: 4,
				transition: 'none',
				'&:hover': {
					backgroundColor: hover.tertiary,
				},
			}),
		},
	},
	MuiInputBase: {
		styleOverrides: {
			root: ({ theme }) => ({
				borderRadius: 4,
			}),
		},
	},
	MuiList: {
		styleOverrides: {
			root: ({ theme }) => ({
				padding: 0,
			}),
		},
	},
	MuiListItemText: {
		styleOverrides: {
			root: ({ theme }) => ({
				[theme.breakpoints.up('sm')]: {
					marginBottom: '0rem',
				},
				[theme.breakpoints.up('md')]: {
					marginBottom: '0.2rem',
				},
				[theme.breakpoints.up('lg')]: {
					marginBottom: '0.4rem',
				},
			}),
		},
	},
	MuiListItemButton: {
		styleOverrides: {
			root: ({ theme }) => ({
				transition: 'none',
				borderRadius: 4,
				'&:hover': {
					backgroundColor: theme.palette.action.hover,
				},
			}),
		},
	},
	MuiListItemIcon: {
		styleOverrides: {
			root: ({ theme }) => ({
				minWidth: '0px',
				padding: '0 16px 0 0',
			}),
		},
	},
	MuiMenu: {
		styleOverrides: {
			paper: ({ theme }) => ({
				borderRadius: 4,
				marginTop: '0.5rem',
				boxShadow: theme.shadows[8],
				'& .MuiMenu-list': {
					paddingTop: 0,
					paddingBottom: 0,
					'& li': { paddingTop: '0.5rem', paddingBottom: '0.5rem' },
					'& li.Mui-selected': {
						color: theme.palette.text.primary,
						backgroundColor: theme.palette.action.selected, // neutral selection colour
					},
				},
			}),
		},
	},
	MuiMenuItem: {
		styleOverrides: {
			root: ({ theme }) => ({
				backgroundColor: 'inherit',
				color: theme.palette.text.secondary,
				minWidth: 100,
				'&:hover': { backgroundColor: theme.palette.action.hover },
				'&.Mui-selected:hover': { backgroundColor: theme.palette.action.hover },
				[theme.breakpoints.up('sm')]: { fontSize: '0.7rem' },
				[theme.breakpoints.up('md')]: { fontSize: '0.75rem' },
				[theme.breakpoints.up('lg')]: { fontSize: '0.8rem' },
			}),
		},
	},
	MuiOutlinedInput: {
		styleOverrides: {
			root: ({ theme }) => ({
				backgroundColor: background.fill,
				borderRadius: 4,
			}),
			input: ({ theme }) => ({
				backgroundColor: background.fill,
				'&.Mui-disabled': {
					backgroundColor: disabled.secondary,
					cursor: 'not-allowed',
				},
			}),
		},
	},
	MuiPaginationItem: {
		styleOverrides: {
			root: ({ theme }) => ({
				'&.Mui-selected': {
					backgroundColor: theme.palette.action.selected,
					color: theme.palette.text.primary,
					'&:hover': { backgroundColor: theme.palette.action.hover },
				},
				'&:hover': { backgroundColor: theme.palette.action.hover },
			}),
		},
	},
	MuiPaper: {
		styleOverrides: {
			root: ({ theme }) => ({
				marginTop: 4,
				padding: 0,
				border: `1px solid ${border.light}`,
				borderRadius: 4,
				boxShadow:
					'0px 4px 24px -4px rgba(16, 24, 40, 0.08), 0px 3px 3px -3px rgba(16, 24, 40, 0.03)',
				backgroundColor: theme.palette.background.content,
				backgroundImage: 'none',
			}),
		},
	},
	MuiSelect: {
		styleOverrides: {
			standard: {
				select: { borderRadius: 4, border: 'none', boxShadow: 'none' },
				icon: { right: '0.5rem' },
			},
			outlined: {
				select: {
					borderRadius: 4,
					border: `1px solid ${makeAlpha(neutral.gray900, 0.19)}`, // replaces #00000030
					boxShadow: '0px 0px 20px -10px rgba(0,0,0,0.1)',
				},
				icon: { right: '0.5rem' },
			},
		},
	},
	MuiSnackbar: {
		styleOverrides: {
			root: ({ theme }) => ({
				'& .MuiAlert-root': {
					fontWeight: 500,
					borderRadius: 8,
					minWidth: 300,
					fontSize: 14,
					borderLeftWidth: 5,
					'&.MuiAlert-standardSuccess': {
						backgroundColor: alert.successLight,
						borderLeftColor: alert.success,
					},
					'&.MuiAlert-standardError': {
						backgroundColor: alert.errorLight,
						borderLeftColor: alert.error,
					},
					'&.MuiAlert-standardWarning': {
						backgroundColor: alert.warningLight,
						borderLeftColor: alert.warning,
					},
					'&.MuiAlert-standardInfo': {
						backgroundColor: theme.palette.background.content,
						borderLeft: 'none',
						color: theme.palette.text.secondary,
					},
				},
			}),
		},
	},
	MuiTab: {
		styleOverrides: {
			root: ({ theme }) => ({
				textTransform: 'none',
				fontWeight: 400,
				[theme.breakpoints.up('sm')]: { fontSize: '0.7rem' },
				[theme.breakpoints.up('md')]: { fontSize: '0.75rem' },
				[theme.breakpoints.up('lg')]: { fontSize: '0.8rem' },
			}),
		},
		defaultProps: {
			disableRipple: true, // Disable ripple effect for all tab buttons
		},
	},
	MuiTableCell: {
		styleOverrides: {
			root: ({ theme }) => ({
				[theme.breakpoints.up('sm')]: { fontSize: '0.7rem' },
				[theme.breakpoints.up('md')]: { fontSize: '0.75rem' },
				[theme.breakpoints.up('lg')]: { fontSize: '0.8rem' },
			}),
			head: ({ theme }) => ({
				color: `${text.notes} !important`,
				fontWeight: '500',
				paddingLeft: '0.3rem',
				paddingRight: '0.3rem',
				[theme.breakpoints.up('sm')]: {
					fontSize: '0.65rem',
					paddingBottom: '0.3rem',
					paddingTop: '0.3rem',
				},
				[theme.breakpoints.up('md')]: {
					fontSize: '0.7rem',
					paddingBottom: '0.4rem',
					paddingTop: '0.4rem',
				},
				[theme.breakpoints.up('lg')]: {
					fontSize: '0.75rem',
					paddingBottom: '0.6rem',
					paddingTop: '0.6rem',
				},
			}),
			body: ({ theme }) => ({
				paddingLeft: '0.3rem',
				paddingRight: '0.3rem',
				[theme.breakpoints.up('sm')]: {
					paddingBottom: '0.3rem',
					paddingTop: '0.3rem',
				},
				[theme.breakpoints.up('md')]: {
					paddingBottom: '0.5rem',
					paddingTop: '0.5rem',
				},
				[theme.breakpoints.up('lg')]: {
					paddingBottom: '0.7rem',
					paddingTop: '0.7rem',
				},
			}),
		},
	},
	MuiTableContainer: {
		styleOverrides: {
			root: ({ theme }) => ({
				overflow: 'visible',
				boxShadow: 'none',
				borderBottom: 1,
			}),
		},
	},
	MuiTableBody: {
		styleOverrides: {
			root: ({ theme }) => ({
				'& .MuiTableRow-root:hover': {
					backgroundColor: `${hover.alt} !important`,
				},
			}),
		},
	},
	MuiTableSortLabel: {
		styleOverrides: {
			root: ({ theme }) => ({
				'& .MuiTableSortLabel-icon': {
					opacity: 1,
				},
				color: `${theme.palette.text.notes} !important`,
			}),
		},
	},
	MuiToggleButton: {
		styleOverrides: {
			root: {
				color: 'black',
				textTransform: 'none',
				padding: '0.45rem 1.25rem',
				boxShadow: `0px 1px 2px 0px ${makeAlpha(neutral.gray900, 0.05)}`,
				borderRadius: 4,
				fontWeight: 400,
			},
		},
	},
	MuiToggleButtonGroup: {
		styleOverrides: {
			root: {
				backgroundColor: background.fill,
				'& .Mui-selected': {
					fontWeight: 'bold',
				},
			},
		},
	},
	MuiDrawer: {
		styleOverrides: {
			paper: {
				boxSizing: 'border-box',
				borderRight: `1px solid ${border.light}`,
				borderRadius: 0,
				boxShadow: 'none',
				margin: 0,
			},
		},
	},
	MuiAppBar: {
		styleOverrides: {
			root: {
				backgroundColor: background.fill,
				color: text.secondary,
				paddingLeft: 15,
				paddingRight: 5,
				borderRadius: 0,
				borderTop: 'none',
				boxShadow: 'none',
				margin: 0,
			},
		},
	},
	MuiTextField: {
		styleOverrides: {
			root: ({ theme }) => ({
				'& .MuiFormHelperText-root': {
					marginLeft: 0,
				},
			}),
		},
	},
};

const globalTheme = baseTheme;
export default globalTheme;
