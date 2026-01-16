// -----------------------------------------------------------------------------
// Utilities for coercing string values extracted from a `multipart/form-data`
// request into strongly-typed primitives. Centralizing these utilities helps
// avoid ad-hoc parsing logic scattered throughout API routes.
// -----------------------------------------------------------------------------

import { isValidEmail } from './validationUtils';

/**
 * Parses a string value (typically from a form input such as a checkbox)
 * into a boolean. Recognizes common truthy and falsy representations.
 *
 * Recognized as `true`: "true", "1", "on", "yes" (case-insensitive)
 * Recognized as `false`: "false", "0", "off", "no", "" (empty string)
 *
 * If the input is `undefined` or `null`, returns `undefined`.
 * Any unrecognized value defaults to `false`.
 *
 * @param raw - The raw string value to parse.
 * @returns `true` or `false` if parsed, or `undefined` if input is `undefined` or `null`.
 */
export function parseBoolean(raw?: string | null): boolean | undefined {
	if (raw === undefined || raw === null) return undefined;
	const val = raw.toString().trim().toLowerCase();
	if (['true', '1', 'on', 'yes'].includes(val)) return true;
	if (['false', '0', 'off', 'no', ''].includes(val)) return false;
	return false;
}

/**
 * Normalizes an optional text input so that an empty string is converted to `null`,
 * while `undefined` (field not present at all) is preserved. This allows you to
 * distinguish between "user cleared the field" (=> `null`) and "user did not touch
 * the field" (=> `undefined`) when building partial update payloads.
 *
 * @param raw - The raw string value to normalize.
 * @returns The trimmed string, `null` if the string is empty, or `undefined` if input is `undefined` or `null`.
 */
export function emptyToNull(raw?: string | null): string | null | undefined {
	if (raw === undefined || raw === null) return undefined;
	const trimmed = raw.trim();
	return trimmed === '' ? null : trimmed;
}

/**
 * Deduplicate an array of items by e-mail (case-insensitive).
 * Accepts either ContactOption[] or string[].
 *
 * @param arr - Array of ContactOption or string.
 * @param getEmail - Function to extract the e-mail from each item.
 * @returns Deduplicated array.
 */
export function dedupeByEmail<T>(arr: T[], getEmail: (item: T) => string): T[] {
	return Array.from(new Map(arr.map((item) => [getEmail(item).toLowerCase(), item])).values());
}

/**
 * Generalized handler for Autocomplete onChange.
 * Handles both ContactOption[] and string[] (free-form e-mails).
 *
 * @param event - The SyntheticEvent from Autocomplete.
 * @param newValue - The new value array.
 * @param onChange - The form onChange handler.
 * @param getEmail - Function to extract e-mail from each item.
 * @param filterValid - Optional: filter for valid e-mails (for free-form).
 */
export const handleEmailSelection = <T>(
	newValue: T[],
	onChange: (val: any) => void,
	getEmail: (item: T) => string,
	filterValid?: boolean,
) => {
	let items = newValue;
	if (filterValid) {
		items = (newValue as string[]).map((s) => s.trim()).filter(isValidEmail) as T[];
	}
	onChange(dedupeByEmail(items, getEmail));
};
