import { logWarn, logError } from '@/lib/logger';
import { SupabaseProvider } from '@/services/storage/supabase/supabaseStorageProvider';

/**
 * Metadata for a file upload.
 */
export type FileMetadata = {
	fileName: string;
	userId: string;
	fileType: string;
};

/**
 * Result of a file upload operation.
 */
export type UploadResult = {
	filePath: string;
};

/**
 * Interface for storage providers.
 */
export interface StorageProvider {
	upload(
		fileBuffer: Buffer,
		metadata: FileMetadata,
		bucket?: string,
	): Promise<UploadResult>;

	delete(filePath: string, bucket?: string): Promise<void>;

	list(prefix?: string, bucket?: string): Promise<string[]>;

	generateSignedUrl(
		filePath: string,
		expiresIn: number,
		bucket?: string,
	): Promise<string>;
}

/**
 * Placeholder local provider (safe for laptop dev).
 */
export class PlaceholderProvider implements StorageProvider {
	async upload(
		_fileBuffer: Buffer,
		_metadata: FileMetadata,
		_bucket?: string,
	): Promise<UploadResult> {
		logWarn('PlaceholderProvider: upload called');
		return { filePath: 'https://example.com/placeholder-url' };
	}

	async delete(_filePath: string, _bucket?: string): Promise<void> {
		logWarn('PlaceholderProvider: delete called');
	}

	async list(_prefix?: string, _bucket?: string): Promise<string[]> {
		logWarn('PlaceholderProvider: list called');
		return [];
	}

	async generateSignedUrl(
		filePath: string,
		expiresIn: number,
		_bucket?: string,
	): Promise<string> {
		logWarn('PlaceholderProvider: generateSignedUrl called');
		return `https://example.com/signed-url?file=${filePath}&expires_in=${expiresIn}`;
	}
}

/**
 * Selects storage provider at RUNTIME (important for Next.js).
 * Never crashes if env is missing.
 */
function selectStorageProvider(): StorageProvider {
	const provider = process.env.STORAGE_PROVIDER ?? 'local';

	console.log('[storageService] STORAGE_PROVIDER =', provider);

	switch (provider) {
		case 'supabase':
			return new SupabaseProvider();

		case 'local':
			return new PlaceholderProvider();

		default:
			logWarn(
				`Unknown STORAGE_PROVIDER "${provider}", falling back to local`,
			);
			return new PlaceholderProvider();
	}
}

/**
 * Singleton storage provider instance.
 * Safe because selection has fallback.
 */
const storageProvider: StorageProvider = selectStorageProvider();

/**
 * Public storage service API.
 */
export const storageService = {
	async uploadFile(
		fileBuffer: Buffer,
		metadata: FileMetadata,
		bucket?: string,
	): Promise<string> {
		try {
			const result = await storageProvider.upload(
				fileBuffer,
				metadata,
				bucket,
			);
			return result.filePath;
		} catch (error) {
			logError('Error uploading file:', error);
			throw new Error('File upload failed');
		}
	},

	async listFiles(prefix = '', bucket?: string): Promise<string[]> {
		return storageProvider.list(prefix, bucket);
	},

	async generateSignedUrl(
		filePath: string,
		expiresIn = 60 * 60,
		bucket?: string,
	): Promise<string> {
		return storageProvider.generateSignedUrl(
			filePath,
			expiresIn,
			bucket,
		);
	},

	async deleteFile(filePath: string, bucket?: string): Promise<void> {
		try {
			await storageProvider.delete(filePath, bucket);
		} catch (error) {
			logError('Error deleting file:', error);
			throw new Error('File deletion failed');
		}
	},
};
