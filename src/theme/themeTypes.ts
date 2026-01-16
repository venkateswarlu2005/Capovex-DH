export interface TextTokens {
	primary: string;
	secondary: string;
	tertiary: string;
	notes: string;
	brand: string;
	error: string;
}

export interface BackgroundTokens {
	content: string;
	alt: string;
	paper: string;
	primary: string;
	fill: string;
	error: string;
	secondary: string;
	secondaryButton: string;
}

export interface HoverTokens {
	primary: string;
	secondary: string;
	tertiary: string;
	alt: string;
	error: string;
}

export interface AlertTokens {
	info: string;
	infoLight: string;
	warning: string;
	warningLight: string;
	error: string;
	errorLight: string;
	success: string;
	successLight: string;
	default: string;
}

export interface BorderTokens {
	light: string;
	dark: string;
}

export interface DisabledTokens {
	primary: string;
	secondary: string;
	error: string;
}

export type ToneRamp = {
	20: string;
	40: string;
	60: string;
	80: string;
	90: string;
	95: string;
};

export interface BrandPalette {
	/** Core brand hues ---------------------------------------------------- */
	primary: ToneRamp;
	secondary: ToneRamp;
	tertiary: ToneRamp; // mapped to MUI “info” slot

	/** Semantic / status hues -------------------------------------------- */
	success: ToneRamp;
	warning: ToneRamp;
	error: ToneRamp;

	/** Greys & surfaces --------------------------------------------------- */
	neutral: ToneRamp; // light-mode greys
}
