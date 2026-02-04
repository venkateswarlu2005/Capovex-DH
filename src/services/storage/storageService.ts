import fs from 'fs/promises';
import path from 'path';

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
	filePath: string; // ALWAYS db-safe path
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
 * Local filesystem provider (used when STORAGE_PROVIDER=local).
 * Files are saved to /public/uploads and are browser-accessible.
 */
export class PlaceholderProvider implements StorageProvider {
	private uploadRoot = path.join(process.cwd(), 'public', 'uploads');

	async upload(
		fileBuffer: Buffer,
		metadata: FileMetadata,
	): Promise<UploadResult> {
		const filePath = `${metadata.userId}/${metadata.fileName}`;
		const fullPath = path.join(this.uploadRoot, filePath);

		await fs.mkdir(path.dirname(fullPath), { recursive: true });
		await fs.writeFile(fullPath, fileBuffer);

		logWarn(`Local upload saved: ${filePath}`);

		return { filePath };
	}

	async delete(filePath: string): Promise<void> {
		const fullPath = path.join(this.uploadRoot, filePath);
		await fs.unlink(fullPath).catch(() => {});
	}

	async list(_prefix?: string): Promise<string[]> {
		return [];
	}

	async generateSignedUrl(
		filePath: string,
		_expiresIn: number,
	): Promise<string> {
		// Local files are directly accessible
		return `/uploads/${filePath}`;
	}
}

/**
 * Selects storage provider at runtime (important for Next.js).
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
 */
const storageProvider: StorageProvider = selectStorageProvider();

/**
 * Public storage service API (DB-agnostic).
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
