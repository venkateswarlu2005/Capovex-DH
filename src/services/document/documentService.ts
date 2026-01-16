import prisma from '@/lib/prisma';
import { ServiceError, statsService, storageService, systemSettingService } from '@/services';

import { SIGNED_URL_TTL, STORAGE_BUCKET } from '@/shared/config/storageConfig';

export const documentService = {
	/**
	 * Retrieves all documents for the specified user, including user info and associated links with their visitors.
	 *
	 * @param userId - The unique identifier of the user.
	 * @returns An array of document records with associated user and link stats.
	 */
	async getUserDocuments(userId: string) {
		const docs = await prisma.document.findMany({
			where: { userId },
			select: {
				documentId: true,
				fileName: true,
				filePath: true,
				fileType: true,
				size: true,
				createdAt: true,
				updatedAt: true,
				user: { select: { firstName: true, lastName: true } },
			},
			orderBy: { createdAt: 'desc' },
		});

		const statsArray = await Promise.all(
			docs.map((d) => statsService.getQuickStatsForDocument(d.documentId)),
		);

		return docs.map((doc, idx) => {
			return {
				documentId: doc.documentId,
				fileName: doc.fileName,
				filePath: doc.filePath,
				fileType: doc.fileType,
				size: doc.size,
				createdAt: doc.createdAt.toISOString(),
				updatedAt: doc.updatedAt.toISOString(),
				uploader: {
					name: `${doc.user.firstName} ${doc.user.lastName}`,
					avatar: null,
				},
				stats: statsArray[idx],
			};
		});
	},

	/**
	 * Creates a new document record for the given user.
	 *
	 * @param params - The document creation parameters.
	 * @param params.userId - The unique identifier of the user.
	 * @param params.fileName - The name of the file.
	 * @param params.filePath - The storage path of the file.
	 * @param params.fileType - The MIME type of the file.
	 * @param params.size - The size of the file in bytes.
	 * @returns The created document record.
	 */
	async createDocument({
		userId,
		fileName,
		filePath,
		fileType,
		size,
	}: {
		userId: string;
		fileName: string;
		filePath: string;
		fileType: string;
		size: number;
	}) {
		return prisma.document.create({
			data: {
				userId,
				fileName,
				filePath,
				fileType,
				size,
			},
		});
	},

	/**
	 * Fetches a single document by its ID, ensuring it belongs to the specified user.
	 *
	 * @param userId - The unique identifier of the user.
	 * @param documentId - The unique identifier of the document.
	 * @returns The document record with associated user and stats, or null if not found or no access.
	 * @throws ServiceError if the document is not found or access is denied.
	 */
	async getDocumentById(userId: string, documentId: string) {
		const doc = await prisma.document.findFirst({
			where: { documentId, userId },
			select: {
				documentId: true,
				fileName: true,
				filePath: true,
				fileType: true,
				size: true,
				createdAt: true,
				updatedAt: true,
				user: { select: { firstName: true, lastName: true } },
			},
		});
		if (!doc) return null;

		const stats = await statsService.getQuickStatsForDocument(documentId);

		return {
			documentId: doc.documentId,
			fileName: doc.fileName,
			filePath: doc.filePath,
			fileType: doc.fileType,
			size: doc.size,
			createdAt: doc.createdAt.toISOString(),
			updatedAt: doc.updatedAt.toISOString(),
			uploader: {
				name: `${doc.user.firstName} ${doc.user.lastName}`,
				avatar: null,
			},
			stats,
		};
	},

	/**
	 * Updates a document's file name if owned by the user, returning the updated record.
	 *
	 * @param userId - The unique identifier of the user.
	 * @param documentId - The unique identifier of the document.
	 * @param data - The update payload, containing an optional fileName.
	 * @returns The updated document record if successful, otherwise null.
	 */
	async updateDocument(userId: string, documentId: string, data: { fileName?: string }) {
		// Ensure the document is owned by user
		const existingDoc = await prisma.document.findUnique({
			where: { documentId },
		});
		if (!existingDoc || existingDoc.userId !== userId) {
			return null; // signals "not found or no access"
		}

		return prisma.document.update({
			where: { documentId },
			data: {
				fileName: data.fileName ?? existingDoc.fileName,
			},
		});
	},

	/**
	 * Deletes a document and its file from storage if the user owns it.
	 *
	 * @param userId - The unique identifier of the user.
	 * @param documentId - The unique identifier of the document.
	 * @returns The deleted document record if successful, otherwise null.
	 */
	async deleteDocument(userId: string, documentId: string) {
		// Check ownership
		const document = await prisma.document.findUnique({
			where: { documentId },
		});
		if (!document || document.userId !== userId) {
			return null; // signals "not found or no access"
		}

		// Delete from DB
		const deletedDoc = await prisma.document.delete({
			where: { documentId },
		});

		// Delete from storage
		await storageService.deleteFile(deletedDoc.filePath);

		return deletedDoc;
	},

	/**
	 * Retrieves all visitors who accessed any link under this document.
	 *
	 * @param userId - The unique identifier of the user.
	 * @param documentId - The unique identifier of the document.
	 * @returns An array of visitor records, or null if the document is not found or not owned by the user.
	 */
	async getDocumentVisitors(userId: string, documentId: string) {
		// Ensure doc ownership
		const doc = await prisma.document.findFirst({
			where: { documentId, userId },
			include: { documentLinks: true },
		});
		if (!doc) return null; // doc not found or no access

		// Gather linkIds
		const linkIds = doc.documentLinks.map((l) => l.documentLinkId);
		if (linkIds.length === 0) {
			return [];
		}

		// Query link visitors
		return prisma.documentLinkVisitor.findMany({
			where: { documentLinkId: { in: linkIds } },
			orderBy: { updatedAt: 'desc' },
		});
	},

	/**
	 * Verifies that the document identified by documentId is owned by userId.
	 * Throws a ServiceError with status 404 if not found or if access is denied.
	 *
	 * @param userId - The ID of the current user.
	 * @param documentId - The document identifier.
	 * @returns A promise that resolves if ownership is validated.
	 * @throws ServiceError if the document is not found or access is denied.
	 */
	async verifyOwnership(userId: string, documentId: string): Promise<void> {
		const document = await prisma.document.findFirst({
			where: { documentId, userId },
			select: { documentId: true },
		});

		if (!document) {
			throw new ServiceError('Document not found or access denied.', 404);
		}
	},

	/**
	 * Generates a short-lived signed URL for a document the user owns.
	 *
	 * @param userId - The authenticated user ID.
	 * @param documentId - The document’s cuid.
	 * @throws ServiceError if document not found or not owned.
	 */
	async getSignedUrlForOwner(userId: string, documentId: string): Promise<string> {
		// Verify ownership + fetch path
		const doc = await prisma.document.findFirst({
			where: { documentId, userId },
			select: { filePath: true },
		});
		if (!doc) {
			throw new ServiceError('Document not found or access denied.', 404);
		}

		// Delegate to storage service
		return storageService.generateSignedUrl(doc.filePath, SIGNED_URL_TTL, STORAGE_BUCKET);
	},

	/**
	 * Validates the file type and size against system settings or environment variables.
	 * - Allowed MIME types from system settings or environment variables.
	 * - Maximum file size in MB from system settings or environment variables.
	 *
	 * @param file - The file object to validate.
	 * @throws ServiceError if the file type is not allowed or the file is too large.
	 */
	async validateUploadFile(file: File) {
		const { maxFileSizeMb, allowedMimeTypes } = await systemSettingService.getUploadLimits();

		const whitelist = (allowedMimeTypes ?? []).filter(Boolean);

		// If no allowed types are configured, allow all types
		if (whitelist.length && !whitelist.includes(file.type)) {
			throw new ServiceError(
				`INVALID_FILE_TYPE: ${file.type} is not allowed. Allowed types: ${whitelist.join(', ')}`,
				400,
			);
		}

		const fileSizeMB = file.size / (1024 * 1024);
		const limit = maxFileSizeMb ?? 1;
		if (fileSizeMB > limit) {
			throw new ServiceError(
				`FILE_TOO_LARGE: ${fileSizeMB.toFixed(2)}MB exceeds limit of ${limit}MB`,
				413,
			);
		}
	},
};
