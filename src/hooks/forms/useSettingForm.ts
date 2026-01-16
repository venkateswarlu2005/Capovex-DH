/**
 * useSettingForm.ts
 * ---------------------------------------------------------------------------
 * React-hook helper for the **Branding & Layout** settings section.
 * Combines:
 *   • Zod schema  – UpdateBrandingSettingSchema
 *   • RHF state   – useFormWithSchema
 *   • Initial API data hydration (optional)
 * ---------------------------------------------------------------------------
 */

import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

import { useFormWithSchema } from '@/hooks/forms';
import { UpdateBrandingSettingSchema } from '@/shared/validation/settingSchemas';
import { BgPreset, ThemePreset } from '@/shared/config/brandingConfig';

export type UpdateBrandingSettingFormValues = z.infer<typeof UpdateBrandingSettingSchema> & {
	logo?: File;
};

/**
 * @param initial  – Optional API payload `{ primaryColor, themePreset, bgPreset, showPersonalInfo, displayName, logo }`
 *                   Passed when settings data has loaded to prime defaults.
 */
export function useSettingForm(
	initial?: Partial<UpdateBrandingSettingFormValues>,
	mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur',
): UseFormReturn<UpdateBrandingSettingFormValues> & {
	buildPayload: () => Omit<UpdateBrandingSettingFormValues, 'logo'>;
} {
	/* Build default values by merging Zod-generated defaults with API data */
	const defaults: UpdateBrandingSettingFormValues = {
		primaryColor: '#1570EF',
		themePreset: null as ThemePreset | null,
		bgPreset: 'plain' as BgPreset,
		showPersonalInfo: false,
		displayName: '',
		logo: undefined,
		...initial, // API data overwrites blanks
	};

	const form = useFormWithSchema(UpdateBrandingSettingSchema, defaults, mode);

	/* ---------------------------------------------------------------------- */
	/*  Mutual-exclusivity auto-cleanup                                        */
	/* ---------------------------------------------------------------------- */
	const { watch, setValue, trigger } = form;

	useEffect(() => {
		const sub = watch((_, { name }) => {
			const current = form.getValues();

			/* ▶️ user picked a preset – wipe hex */
			if (name === 'themePreset' && current.themePreset !== null && current.primaryColor) {
				setValue('primaryColor', undefined, { shouldDirty: true });
				trigger(['primaryColor', 'themePreset']);
			}

			/* ▶️ user typed a hex – wipe preset */
			if (name === 'primaryColor' && current.primaryColor && current.themePreset !== null) {
				setValue('themePreset', null, { shouldDirty: true });
				trigger(['themePreset', 'primaryColor']);
			}
		});
		return () => sub.unsubscribe();
	}, [watch, setValue, trigger, form]);

	/* ---------------------------------------------------------------------- */
	/*  Payload builder – strips blanks & enforces nulling of the opposite    */
	/* ---------------------------------------------------------------------- */
	const buildPayload = (): Omit<UpdateBrandingSettingFormValues, 'logo'> => {
		const { logo, ...raw } = form.getValues() as UpdateBrandingSettingFormValues;

		/* strip undefined / empty-string */
		const filtered = Object.fromEntries(
			Object.entries(raw).filter(([, v]) => v !== undefined && v !== ''),
		) as Record<string, unknown>;

		/* ensure backend clears stale data ---------------------------------- */
		if (filtered.themePreset !== undefined && filtered.themePreset !== null) {
			filtered.primaryColor = null;
		}
		if (filtered.primaryColor) {
			filtered.themePreset = null;
		}

		return filtered as Omit<UpdateBrandingSettingFormValues, 'logo'>;
	};

	return { ...form, buildPayload };
}
