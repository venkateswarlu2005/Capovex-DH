/**
 * systemSettingService.ts
 * ---------------------------------------------------------------------------
 * Centralised access to the singleton SystemSetting row + 30 s in-memory cache.
 * Responsibilities
 *   • getSystemSettings()            – typed DTO for read-only use
 *   • updateSystemSettings(payload)  – PATCH handler helper
 *   • invalidateSystemSettings()     – clears cache after updates
 *   • sendTestEmail(to)              – POST /test-email helper
 *   • getUploadLimits()              – returns current file-upload constraints
 * ---------------------------------------------------------------------------
 */

import { logWarn } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { decryptSecret, encryptSecret } from '@/lib/secrets';

import { emailService, ServiceError } from '@/services';

import { SystemSettingDTO, SystemSettingsUpdatePayload, TestEmailPayload } from '@/shared/models';

const CACHE_TTL_MS = 30_000;
let cache: { data: SystemSettingDTO; fetchedAt: number } | null = null;
let brevoCache: {
	cachedEmailConfig: { apiKey: string; fromName: string; fromEmail: string };
	tag: string;
} | null = null;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Ensures the singleton system setting row exists in the database.
 * If not present, creates it with default values.
 * @returns The Prisma system setting record.
 */
async function ensureRow() {
	return prisma.systemSetting.upsert({
		where: { id: 1 },
		update: {},
		create: {
			enableNotifications: false,
			defaultTtlSeconds: 86_400,
			debugLogs: false,
		},
	});
}

/**
 * Maps a Prisma system setting record to a public DTO, stripping ciphertext.
 * @param row - The Prisma system setting record.
 * @returns The public SystemSettingDTO.
 */
function mapToDTO(row: Awaited<ReturnType<typeof ensureRow>>): SystemSettingDTO {
	return {
		enableNotifications: row.enableNotifications,
		emailFromName: row.emailFromName,
		emailFromAddr: row.emailFromAddr,
		defaultTtlSeconds: row.defaultTtlSeconds,
		maxFileSizeMb: row.maxFileSizeMb,
		allowedMimeTypes: row.allowedMimeTypes,
		debugLogs: row.debugLogs,
		updatedAt: row.updatedAt.toISOString(),
	};
}

/* -------------------------------------------------------------------------- */
/*  Public service                                                            */
/* -------------------------------------------------------------------------- */

export const systemSettingService = {
	/**
	 * Retrieves the current system settings, using a 30-second in-memory cache.
	 * Ensures the singleton row exists in the database.
	 *
	 * @returns The current system settings as a DTO.
	 */
	async getSystemSettings(): Promise<SystemSettingDTO> {
		if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.data;

		const row = await ensureRow();
		const dto = mapToDTO(row);
		cache = { data: dto, fetchedAt: Date.now() };
		return dto;
	},

	/**
	 * Updates the system settings with the provided payload.
	 * Only updates fields present in the payload. Encrypts sensitive credentials.
	 * Invalidates the cache after update.
	 *
	 * @param payload - The update payload, already validated.
	 * @returns The updated system settings as a DTO.
	 */
	async updateSystemSettings(payload: SystemSettingsUpdatePayload): Promise<SystemSettingDTO> {
		const current = await ensureRow();

		const update: Record<string, any> = {};

		// Scalar toggles / numbers
		if (payload.enableNotifications !== undefined)
			update.enableNotifications = payload.enableNotifications;
		if (payload.defaultTtlSeconds !== undefined)
			update.defaultTtlSeconds = payload.defaultTtlSeconds;
		if (payload.debugLogs !== undefined) update.debugLogs = payload.debugLogs;
		if ('maxFileSizeMb' in payload) update.maxFileSizeMb = payload.maxFileSizeMb;
		if ('allowedMimeTypes' in payload) update.allowedMimeTypes = payload.allowedMimeTypes;

		// Credentials (encrypt if supplied)
		if (payload.brevoApiKey) update.brevoApiKeyEnc = encryptSecret(payload.brevoApiKey);
		if (payload.emailFromName !== undefined) update.emailFromName = payload.emailFromName;
		if (payload.emailFromAddr !== undefined) update.emailFromAddr = payload.emailFromAddr;

		const row = await prisma.systemSetting.update({ where: { id: 1 }, data: update });

		this.invalidateSystemSettings();
		return mapToDTO(row);
	},

	/**
	 * Invalidates the in-memory cache for system settings and Brevo config.
	 * Should be called after any update to system settings.
	 */
	invalidateSystemSettings() {
		cache = null;
		brevoCache = null;
	},

	/**
	 * Sends a test email to the specified address using the current notification settings.
	 * Throws if notifications are disabled or sender identity is not configured.
	 * Decrypts the Brevo API key to ensure it is valid before sending.
	 *
	 * @param param0 - The test email payload containing the recipient address.
	 * @throws ServiceError if notifications are disabled, sender identity is missing, or Brevo key is invalid.
	 */
	async sendTestEmail({ to }: TestEmailPayload): Promise<void> {
		const s = await this.getSystemSettings();

		if (!s.enableNotifications) {
			throw new ServiceError('Notifications are disabled', 400);
		}
		if (!s.emailFromAddr || !s.emailFromName) {
			throw new ServiceError('Email sender identity not configured', 400);
		}

		// Decrypt API key early to surface crypto errors
		try {
			const row = await prisma.systemSetting.findUniqueOrThrow({ where: { id: 1 } });
			if (!row.brevoApiKeyEnc) throw new Error('Missing key');
			decryptSecret(row.brevoApiKeyEnc); // will throw if corrupt
		} catch (err) {
			logWarn('Brevo key decryption failed:', err);
			throw new ServiceError('Stored Brevo key is invalid', 500);
		}

		await emailService.sendTransactional({
			to,
			subject: 'Datahall · Test email',
			text: 'This is a test email confirming your notification settings are working.',
			html: '<p>This is a <strong>test email</strong> confirming your notification settings are working.</p>',
			label: 'Test Email',
		});
	},

	/**
	 * Returns the current file upload limits, including max file size and allowed MIME types.
	 * Reads from system settings if available, otherwise falls back to environment variables.
	 *
	 * @returns An object containing maxFileSizeMb and allowedMimeTypes.
	 */
	async getUploadLimits() {
		const s = await this.getSystemSettings();
		return {
			maxFileSizeMb: s.maxFileSizeMb ?? Number(process.env.MAX_FILE_SIZE_MB ?? 1),
			allowedMimeTypes:
				s.allowedMimeTypes?.split(',').map((m) => m.trim()) ??
				(process.env.ALLOWED_FILE_TYPES ?? '').split(','),
		};
	},

	/**
	 * Retrieves the Brevo (Sendinblue) configuration for sending emails.
	 * Decrypts the API key and memoizes the result for efficiency.
	 *
	 * @returns The Brevo config object with apiKey, fromName, and fromEmail, or null if notifications are disabled or not configured.
	 */
	async getBrevoConfig() {
		const row = await prisma.systemSetting.findUnique({
			where: { id: 1 },
			select: {
				enableNotifications: true,
				brevoApiKeyEnc: true,
				emailFromName: true,
				emailFromAddr: true,
			},
		});
		if (!row?.enableNotifications || !row.brevoApiKeyEnc) return null;

		// Cheap memoisation keyed by the ciphertext so we decrypt only when it changes
		if (brevoCache && brevoCache.tag === row.brevoApiKeyEnc) return brevoCache.cachedEmailConfig;

		const apiKey = decryptSecret(row.brevoApiKeyEnc);
		const emailConfig = {
			apiKey,
			fromName: row.emailFromName ?? 'Datahall',
			fromEmail: row.emailFromAddr ?? 'no-reply@datahall.app',
		};

		brevoCache = { cachedEmailConfig: emailConfig, tag: row.brevoApiKeyEnc };
		return emailConfig;
	},
};
