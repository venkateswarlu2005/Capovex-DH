/**
 * Returns a standardized log prefix for all log messages.
 *
 * @param level - The log level (e.g., 'DEBUG', 'INFO', 'WARN', 'ERROR').
 * @returns The formatted log prefix string.
 */
function stamp(level: string): string {
	return `[Datahall][${level}]`;
}

/**
 * Logs a debug message if debugLogs is enabled in system settings.
 * This function is asynchronous because it queries the system settings.
 *
 * @param args - The arguments to log (any type).
 * @returns A promise that resolves when logging is complete.
 */
export async function logDebug(...args: any[]): Promise<void> {
	console.debug(stamp('DEBUG'), ...args);
}

/**
 * Logs an informational message.
 *
 * @param args - The arguments to log (any type).
 */
export function logInfo(...args: any[]): void {
	console.info(stamp('INFO'), ...args);
}

/**
 * Logs a warning message.
 *
 * @param args - The arguments to log (any type).
 */
export function logWarn(...args: any[]): void {
	console.warn(stamp('WARN'), ...args);
}

/**
 * Logs an error message.
 *
 * @param args - The arguments to log (any type).
 */
export function logError(...args: any[]): void {
	console.error(stamp('ERROR'), ...args);
}
