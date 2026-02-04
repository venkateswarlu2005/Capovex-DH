/**
 * A list of public route patterns, expressed as regex strings.
 *//**
 * A list of public route patterns, expressed as regex strings.
 */
export const PUBLIC_ROUTE_PATTERNS: readonly RegExp[] = [
    /^\/auth\/sign-in$/,
    /^\/auth\/sign-up$/,
    /^\/auth\/forgot-password$/,
    /^\/auth\/reset-password(\/.*)?$/,
    /^\/api\/auth\/.*/,
    /^\/documentAccess\/[0-9a-fA-F-]{36}$/,
    /^\/_next\/.*/,
    /^\/favicon\.ico$/,
];

export const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Checks if a given pathname is public by testing against the regex patterns.
 */
export function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTE_PATTERNS.some((rx) => rx.test(pathname));
}

/**
 * Builds a negative‑look‑ahead pattern for Next.js middleware.
 */
export const MIDDLEWARE_MATCHER_PATTERN: string = (() => {
    // This logic now correctly includes the root "/" in the matcher because it's not in public patterns
    const parts = PUBLIC_ROUTE_PATTERNS.map((rx) => rx.source.replace('^\\/', '')).join('|');
    return `^/(?!(${parts})).*`;
})();