import '@mui/material/styles';
import {
	TextTokens,
	BackgroundTokens,
	AlertTokens,
	BorderTokens,
	HoverTokens,
	DisabledTokens,
} from './themeTypes';

declare module '@mui/material' {
	interface SimplePaletteColorOptions {
		text?: string;
	}
}

declare module '@mui/material/styles' {
	interface TypeBackground extends BackgroundTokens {}
	interface TypeText extends Pick<TextTokens, 'primary' | 'secondary'>, Partial<TextTokens> {}

	interface TypeBackground {
		content: string;
		alt: string;
		primary: string;
		fill: string;
		error: string;
		secondary: string; // light-grey / blue tint
		secondaryButton: string; // legacy neutral button BG
		paper: string; // white / brand paper
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

	interface Theme {
		text: TextTokens;
		background: BackgroundTokens;
		hover: HoverTokens;
		alert: AlertTokens;
		border: BorderTokens;
		disabled: DisabledTokens;
	}
	interface ThemeOptions {
		text?: Partial<TextTokens>;
		background?: Partial<BackgroundTokens>;
		hover?: Partial<HoverTokens>;
		alert?: Partial<AlertTokens>;
		border?: Partial<BorderTokens>;
		disabled?: Partial<DisabledTokens>;
	}
}

// For components using Typography
declare module '@mui/material/Typography' {
	interface TypographyPropsVariantOverrides {
		subtitle3: true;
	}
}
