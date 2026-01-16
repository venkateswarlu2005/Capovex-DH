// ──────────────────────────────────────────────────────────────────────────────
// validationUtils.ts
// -----------------------------------------------------------------------------
// Centralised helpers & constants that are reused by multiple validation
// layers (Zod schemas *and* UI components).
// -----------------------------------------------------------------------------

/* ============================================================================
   🔐 Password policy — tweak here, every place else updates automatically
   ========================================================================== */

/**
 * Password policy rules used throughout the application.
 * - MIN_LEN: Minimum number of characters a user password must contain.
 * - NEEDS_UPPERCASE: At least one uppercase Latin letter.
 * - NEEDS_SYMBOL: At least one non-alphanumeric “symbol” character.
 */
export const PASSWORD_RULES = {
    MIN_LEN: 8,
    NEEDS_UPPERCASE: /[A-Z]/,
    NEEDS_SYMBOL: /[!@#$%^&*(),.?":{}|<>]/,
} as const;

/**
 * Checks a password string against the current password policy.
 *
 * @param pwd - The password string to check.
 * @returns An object with booleans for each password rule.
 */
export const getPasswordChecks = (pwd: string) => ({
    isLengthValid: pwd.length >= PASSWORD_RULES.MIN_LEN,
    hasUppercase: PASSWORD_RULES.NEEDS_UPPERCASE.test(pwd),
    hasSymbol: PASSWORD_RULES.NEEDS_SYMBOL.test(pwd),
});

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/**
 * Splits a comma/space separated string into arrays of valid and invalid e-mails.
 *
 * @param raw - The raw string containing one or more e-mail addresses, separated by commas or spaces.
 * @returns An object with arrays: { validEmails, invalidEmails }
 */
export function validateEmails(raw: string) {
    const emails = raw
        .split(/[,\s]+/)
        .map((e) => e.trim())
        .filter(Boolean);

    const validEmails: string[] = [];
    const invalidEmails: string[] = [];

    emails.forEach((email) =>
        EMAIL_REGEX.test(email) ? validEmails.push(email) : invalidEmails.push(email),
    );

    return { validEmails, invalidEmails };
}

/**
 * Checks if a string is a valid e-mail address.
 *
 * @param str - The string to validate as an e-mail address.
 * @returns True if the string is a valid e-mail, false otherwise.
 */
export function isValidEmail(str: string) {
    return EMAIL_REGEX.test(str.trim());
}
