import { randomUUID } from 'crypto';
import path from 'path';

import prisma from '@/lib/prisma';
import { ServiceError, storageService } from '@/services';

import { BG_PRESETS, BgPreset, THEME_PRESETS, ThemePreset } from '@/shared/config/brandingConfig';
import { emptyToNull, parseBoolean } from '@/shared/utils';

import { ASSETS_BUCKET, SIGNED_URL_TTL } from '@/shared/config/storageConfig';
import { BrandingSetting, UpdateBrandingSettingPayload } from '@/shared/models';

/**
 * Represents an uploaded branding image.
 */
export type BrandingImage = {
	buffer: Buffer;
	mimeType: string; // e.g. "image/png"
	originalName: string; // Used solely for extension inference
};

/**
 * Input type for updating account branding settings.
 */
type UpdateSettingsInput = UpdateBrandingSettingPayload & {
	logoFile?: BrandingImage;
};

/**
 * Builds the default branding settings, mirroring Prisma defaults.
 * @returns An object containing default branding settings.
 */
function buildDefaultSettings(): Partial<BrandingSetting> {
	return {
		primaryColor: '#1570EF',
		themePreset: null,
		bgPreset: 'plain',
		showPersonalInfo: false,
		logoUrl: null,
		displayName: null,
	};
}

/**
 * Service for managing account branding settings, including retrieval,
 * updates, logo uploads, and input parsing.
 */
export const brandingSettingService = {
	/**
	 * Retrieves the Branding settings for a user, creating defaults if not present.
	 *
	 * @param userId - The user's unique identifier.
	 * @returns The user's Branding settings object.
	 */
	async getBrandingSettings(userId: string) {
		const existing = await prisma.brandingSetting.findUnique({ where: { userId } });
		console.log('🚀 ~ getBrandingSettings ~ existing:', existing);
		if (existing) return existing;

		// Create default row atomically if not found
		return prisma.brandingSetting.upsert({
			where: { userId },
			update: {},
			create: { userId, ...buildDefaultSettings() },
		});
	},

	/**
	 * Returns the user’s public‐facing display name or `null`
	 * if the user chose not to expose personal info.
	 * @param userId - The user's unique identifier.
	 * @returns The user's display name if available, otherwise `null`.
	 */
	async getDisplayName(userId: string): Promise<string | null> {
		const brandingSettings = await brandingSettingService.getBrandingSettings(userId);
		return brandingSettings.showPersonalInfo && brandingSettings.displayName?.trim()
			? brandingSettings.displayName.trim()
			: null;
	},
	/**
	 * Updates the branding settings for a user, including scalar fields and optional logo file upload.
	 *
	 * @param userId - The user's unique identifier.
	 * @param data - The update input payload containing branding fields and optional logo file.
	 * @returns The updated branding settings object.
	 * @throws ServiceError if the theme preset is invalid or image type is not supported.
	 */
	async updateBrandingSettings(userId: string, data: UpdateSettingsInput) {
		if (
			data.themePreset !== undefined &&
			data.themePreset !== null &&
			data.primaryColor !== undefined
		) {
			throw new ServiceError('Provide either “themePreset” or “primaryColor”, not both.', 400);
		}

		if (data.themePreset && !THEME_PRESETS.includes(data.themePreset)) {
			throw new ServiceError('Invalid theme preset.', 400);
		}

		const current = await brandingSettingService.getBrandingSettings(userId);
		const updates: Record<string, any> = {};

		// Scalar fields
		if (data.primaryColor !== undefined) updates.primaryColor = data.primaryColor;
		if ('themePreset' in data) updates.themePreset = data.themePreset;
		if (data.bgPreset !== undefined) updates.bgPreset = data.bgPreset;
		if (data.showPersonalInfo !== undefined) updates.showPersonalInfo = data.showPersonalInfo;
		if ('displayName' in data) updates.displayName = data.displayName;

		if (data.bgPreset && !BG_PRESETS.includes(data.bgPreset)) {
			throw new ServiceError('Invalid background preset.', 400);
		}

		// If themePreset is set, clear primaryColor to avoid conflicts
		if (data.themePreset !== null) updates.primaryColor = null;

		// Logo upload
		if (data.logoFile) {
			const { buffer, mimeType, originalName } = data.logoFile;
			const MAX_SIZE = 2 * 1024 * 1024;
			const validImageFormats = ['image/png', 'image/jpeg', 'image/svg+xml'];

			// Validate image size
			if (buffer.length > MAX_SIZE) {
				throw new ServiceError('FILE_TOO_LARGE', 413);
			}
			// Validate image type
			if (!validImageFormats.includes(mimeType.toLowerCase())) {
				throw new ServiceError('INVALID_IMAGE_TYPE', 415);
			}

			const ext = path.extname(originalName) || '.png';
			const objectKey = `logo/${randomUUID()}${ext}`;

			await storageService.uploadFile(
				buffer,
				{
					userId,
					fileName: objectKey,
					fileType: mimeType,
				},
				ASSETS_BUCKET,
			);

			// Delete old logo if one existed
			if (current.logoUrl) await storageService.deleteFile(current.logoUrl, ASSETS_BUCKET);

			updates.logoUrl = `${userId}/${objectKey}`;
		}
		// If no updates were made, return the current settings
		if (Object.keys(updates).length === 0) return current;

		// Database update
		return prisma.brandingSetting.update({
			where: { userId },
			data: updates,
		});
	},

	/**
	 * Returns a signed, time-limited URL for the stored logo.
	 * Resolves to `null` when no logo has been set.
	 *
	 * @param relativePath - The relative path to the logo file.
	 * @returns The signed URL as a string, or null if no logo is set.
	 */
	async getSignedLogoUrl(relativePath: string | null) {
		if (!relativePath) return null;
		return storageService.generateSignedUrl(relativePath, SIGNED_URL_TTL, ASSETS_BUCKET);
	},

	/**
	 * Converts an incoming multipart/form-data payload into an UpdateSettingsInput
	 * object understood by the service. Designed for use by the API route.
	 *
	 * @param form - The multipart form data.
	 * @returns The parsed update input object.
	 */
	async buildUpdateInput(form: FormData): Promise<UpdateSettingsInput> {
		/* -------------------- 1. Parse scalar JSON part -------------------- */
		const raw = form.get('payload');
		if (!raw) throw new ServiceError('Missing “payload” part', 400);

		let payload: Record<string, unknown>;
		try {
			const text = typeof raw === 'string' ? raw : await (raw as File).text();
			payload = JSON.parse(text);
		} catch {
			throw new ServiceError('Invalid JSON in “payload”', 400);
		}

		/* -------------------- 2. Coerce & copy into input ------------------ */
		const input: UpdateSettingsInput = {
			primaryColor: payload.primaryColor as string | undefined,
			themePreset: (payload.themePreset ?? null) as ThemePreset | null | undefined,
			bgPreset: payload.bgPreset as BgPreset,
			showPersonalInfo: payload.showPersonalInfo as boolean | undefined,
			displayName: emptyToNull(payload.displayName as string | null | undefined),
		};

		if (input.themePreset && !THEME_PRESETS.includes(input.themePreset)) {
			throw new ServiceError('Invalid theme preset.', 400);
		}

		if (input.themePreset && input.primaryColor) {
			throw new ServiceError('Provide either “themePreset” or “primaryColor”, not both.', 400);
		}

		if (input.bgPreset && !BG_PRESETS.includes(input.bgPreset)) {
			throw new ServiceError('Invalid background preset.', 400);
		}

		/* -------------------- 3. Optional logo file ------------------------ */
		const logo = form.get('logo');
		if (logo instanceof File && logo.size > 0) {
			input.logoFile = {
				buffer: Buffer.from(await logo.arrayBuffer()),
				mimeType: logo.type || 'application/octet-stream',
				originalName: logo.name || 'logo',
			};
		}

		return input;
	},
};
