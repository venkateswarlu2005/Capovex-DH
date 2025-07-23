import '@mui/material/styles';

declare module '@mui/material' {
	interface SimplePaletteColorOptions {
		text?: string;
	}
}

declare module '@mui/material/styles' {
	interface TypeBackground {
		content: string;
		alt: string;
		primary: string;
		fill: string;
		error: string;
		secondary: string; // light-grey / blue tint
		secondaryButton: string; // legacy neutral button BG
	}

	// Extend the Variant type
	interface TypographyVariants {
		allVariants?: React.CSSProperties;
		subtitle3: React.CSSProperties;
	}

	// Extend the Variant type for theme options
	interface TypographyVariantsOptions {
		allVariants?: React.CSSProperties;
		subtitle3?: React.CSSProperties;
	}

	interface TypeText {
		notes: string;
		brand: string;
		error: string;
	}

	interface Theme {
		border: {
			light: string;
			dark: string;
		};
	}
	interface ThemeOptions {
		border?: {
			light: string;
			dark: string;
		};
	}
}

// For components using Typography
declare module '@mui/material/Typography' {
	interface TypographyPropsVariantOverrides {
		subtitle3: true;
	}
}
