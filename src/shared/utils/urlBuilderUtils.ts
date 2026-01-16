/**
 * Utility functions for building fully-qualified URLs for various user actions.
 * All URLs are constructed using the HOST environment variable if set, or fall back to localhost.
 */

/**
 * Returns the application host (protocol + domain + port).
 * Falls back to 'http://localhost:3000' if HOST is not set.
 *
 * @returns The base host URL as a string.
 */
function getHost(): string {
	return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

/**
 * Builds a fully-qualified URL for accessing a shared document link.
 *
 * @param slug - The unique slug or ID of the document link.
 * @returns The complete URL to access the shared document.
 */
export function buildDocumentLinkUrl(slug: string): string {
	return `${getHost()}/documentAccess/${slug}`;
}

/**
 * Builds a fully-qualified URL for resetting a user's password.
 *
 * @param token - The unique password reset token.
 * @returns The complete URL for the password reset page.
 */
export function buildResetPasswordUrl(token: string): string {
	return `${getHost()}/auth/reset-password?token=${token}`;
}

/**
 * Builds a fully-qualified URL for verifying a user's email address.
 *
 * @param token - The unique email verification token.
 * @returns The complete URL for the email verification endpoint.
 */
export function buildVerificationUrl(token: string): string {
	return `${getHost()}/api/auth/verify?token=${token}`;
}
