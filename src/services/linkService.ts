import bcryptjs from 'bcryptjs';
import { randomUUID } from 'crypto';

import { logWarn } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

import {
	brandingService,
	notificationService,
	ServiceError,
	storageService,
	systemSettingService,
} from '@/services';

import { ShareLinkRecipient } from '@/shared/models';
import { buildDocumentLinkUrl } from '@/shared/utils';

export const linkService = {
	/**
	 * Retrieves all links for a specific document, ensuring the requesting user owns the document.
	 *
	 * @param userId - The unique identifier of the user.
	 * @param documentId - The unique identifier of the document.
	 * @returns An array of document links if found, or null if the document is not found or not owned by the user.
	 */
	async getDocumentLinks(userId: string, documentId: string) {
		const doc = await prisma.document.findFirst({
			where: { documentId, userId },
			include: { documentLinks: true },
		});
		if (!doc) return null;
		return doc.documentLinks;
	},

	/**
	 * Creates a new link for the specified document if the user owns it.
	 *
	 * @param userId      - The unique identifier of the user creating the link.
	 * @param documentId  - The unique identifier of the document to link.
	 * @param options     - Options for link creation, including:
	 *   - alias: Optional custom alias for the link.
	 *   - isPublic: Whether the link is public (default: false).
	 *   - password: Optional password for link protection.
	 *   - expirationTime: Optional ISO string for link expiration.
	 *   - visitorFields: Array of visitor field keys to collect.
	 *   - recipients: Array of email addresses to notify.
	 * @returns The created document link with a generated URL.
	 * @throws ServiceError if the document is not found, expiration is in the past, or alias conflicts.
	 */
	async createLinkForDocument(
		userId: string,
		documentId: string,
		options: {
			alias?: string;
			isPublic?: boolean;
			password?: string;
			expirationTime?: string;
			visitorFields?: string[];
			recipients?: ShareLinkRecipient[];
		},
	) {
		const { alias, isPublic = false, password, expirationTime, visitorFields = [] } = options;
		return prisma.$transaction(async (tx) => {
			// Ensure the document exists and is owned by the user
			const doc = await tx.document.findFirst({
				where: { documentId, userId },
				select: { documentId: true, fileName: true },
			});

			if (!doc) throw new ServiceError('DOCUMENT_NOT_FOUND', 404);

			// Validate expiration time if provided
			if (expirationTime && new Date(expirationTime) < new Date()) {
				throw new ServiceError('EXPIRATION_PAST', 400);
			}
			let finalExpiration: Date | null = null;
			if (expirationTime) {
				finalExpiration = new Date(expirationTime);
			} else {
				// Use default TTL from system settings if not provided
				const ttl = (await systemSettingService.getSystemSettings()).defaultTtlSeconds;
				finalExpiration = new Date(Date.now() + ttl * 1_000);
			}

			// Generate unique link ID and hash password if provided
			const slug = randomUUID(); // <- documentLinkId
			const hashedPassword = password ? await bcryptjs.hash(password, 10) : null;

			try {
				const created = await tx.documentLink.create({
					data: {
						documentLinkId: slug,
						documentId: doc.documentId,
						createdByUserId: userId,
						alias: alias?.trim() || null,
						isPublic,
						password: hashedPassword,
						expirationTime: finalExpiration,
						visitorFields,
					},
				});
				// Return with fresh URL (in case HOST differs by env)
				return { ...created, linkUrl: buildLinkUrl(slug) };
			} catch (err) {
				if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
					// Collision on (documentId, alias)
					throw new ServiceError('LINK_ALIAS_CONFLICT', 409);
				}
				throw err;
			}
		});
	},

	/**
	 * Deletes a link if it belongs to the user.
	 *
	 * @param userId - The unique identifier of the user.
	 * @param documentLinkId - The unique identifier of the document link.
	 * @returns The deleted document link record.
	 * @throws ServiceError if the link is not found or not owned by the user.
	 */
	async deleteLink(userId: string, documentLinkId: string) {
		const link = await prisma.documentLink.findFirst({
			where: { documentLinkId, createdByUserId: userId },
		});

		if (!link) throw new ServiceError('Link not found', 404);
		return prisma.documentLink.delete({
			where: { documentLinkId: link.documentLinkId },
		});
	},

	/**
	 * Retrieves a public link by its identifier.
	 *
	 * @param linkId - The public link identifier.
	 * @returns The document link record if found, otherwise null.
	 */
	async getPublicLink(linkId: string) {
		return prisma.documentLink.findUnique({
			where: { documentLinkId: linkId },
		});
	},

	/**
	 * Verifies a link's password if it exists, returning true if valid or if no password is set.
	 *
	 * @param link - The link object containing the password hash or null.
	 * @param providedPassword - The password provided by the user.
	 * @returns True if the password is valid or not required, false otherwise.
	 */
	async verifyLinkPassword(
		link: { password: string | null },
		providedPassword?: string,
	): Promise<boolean> {
		if (!link.password) {
			// No password is set => no check needed
			return true;
		}
		if (!providedPassword) return false;
		const isValid = await bcryptjs.compare(providedPassword, link.password);
		return isValid;
	},

	/**
	 * Asserts a link is accessible by checking existence and expiration.
	 * Optionally verifies password unless skipPasswordCheck is true.
	 *
	 * @param linkId    - The public link identifier.
	 * @param password  - The password submitted (if any).
	 * @param options   - Optional settings, e.g. { skipPasswordCheck: true }.
	 * @returns The link record if accessible, or throws a ServiceError.
	 * @throws ServiceError if link not found, expired, or password invalid.
	 */
	async validateLinkAccess(
		linkId: string,
		password?: string,
		options?: { skipPasswordCheck?: boolean },
	) {
		const link = await linkService.getPublicLink(linkId);
		if (!link) throw new ServiceError('Link not found', 404);

		if (link.expirationTime && new Date(link.expirationTime) <= new Date()) {
			throw new ServiceError('Link is expired', 410);
		}

		if (!options?.skipPasswordCheck) {
			if (!(await linkService.verifyLinkPassword(link, password))) {
				throw new ServiceError('Invalid password', 401);
			}
		}

		return link;
	},

	/**
	 * Logs a new record in LinkVisitors for this link.
	 * Skips logging if the link is public.
	 *
	 * @param linkId - The unique identifier of the document link.
	 * @param firstName - The visitor's first name (optional).
	 * @param lastName - The visitor's last name (optional).
	 * @param email - The visitor's email address (optional).
	 * @param visitorMetaData - Additional metadata about the visitor.
	 * @returns The created visitor record, or null if logging is skipped.
	 */
	async logVisitor(
		linkId: string,
		firstName = '',
		lastName = '',
		email = '',
		visitorMetaData: Prisma.InputJsonValue = {},
	) {
		const link = await prisma.documentLink.findUnique({
			where: { documentLinkId: linkId },
			select: { isPublic: true },
		});
		if (!link || link.isPublic) return null; // skip logging for public links

		return prisma.documentLinkVisitor.create({
			data: { documentLinkId: linkId, firstName, lastName, email, visitorMetaData },
		});
	},

	/**
	 * Retrieves all visitors who accessed a specific link under a document, ensuring ownership.
	 *
	 * @param userId     - The unique identifier of the user.
	 * @param documentId - The unique identifier of the document.
	 * @param linkId     - The unique identifier of the document link.
	 * @returns An array of visitor records, or null if the link is not found or not owned by the user.
	 */
	async getDocumentLinkVisitors(userId: string, documentId: string, linkId: string) {
		// Ensure the link belongs to the specified document and user (i.e., verify ownership)
		const link = await prisma.documentLink.findFirst({
			where: { documentLinkId: linkId, document: { documentId: documentId, userId: userId } },
		});
		if (!link) return null; // link not found or no access

		// Query link visitors, ordered by most recent visit
		return prisma.documentLinkVisitor.findMany({
			where: { documentLinkId: linkId },
			orderBy: { visitedAt: 'desc' },
		});
	},

	/**
	 * Generates a signed file URL for the Document associated with this link,
	 * checking if the link is expired. Throws if link invalid/expired.
	 *
	 * @param linkId - The unique identifier of the document link.
	 * @returns An object containing the signed URL, file name, size, file type, and document ID.
	 * @throws ServiceError if the link or document is not found, or if the link is expired.
	 */
	async getSignedFileFromLink(linkId: string): Promise<{
		signedUrl: string;
		fileName: string;
		size: number;
		fileType: string;
		documentId: string;
	}> {
		const link = await prisma.documentLink.findUnique({
			where: { documentLinkId: linkId },
			include: { document: true },
		});
		if (!link || !link.document) {
			throw new ServiceError('Link not found', 404);
		}

		const { defaultTtlSeconds: defaultTtl } = await systemSettingService.getSystemSettings();
		let expiresIn = defaultTtl;

		if (link.expirationTime) {
			const secondsUntilLinkExpires = Math.floor(
				(link.expirationTime.getTime() - Date.now()) / 1000,
			);

			if (secondsUntilLinkExpires <= 0) throw new ServiceError('Link has expired', 410);

			expiresIn = Math.min(defaultTtl, secondsUntilLinkExpires);
		}

		const signedUrl = await storageService.generateSignedUrl(link.document.filePath, expiresIn);

		return {
			signedUrl,
			fileName: link.document.fileName,
			size: link.document.size,
			fileType: link.document.fileType,
			documentId: link.document.documentId,
		};
	},

	/**
	 * Fetches lightweight metadata for a link, used by the public GET route.
	 * Does not log analytics. Throws if the link is invalid or expired.
	 *
	 * @param linkId - The unique identifier of the document link.
	 * @returns An object containing password protection status, visitor fields, and (if public and unrestricted) signed file metadata.
	 * @throws ServiceError if the link is not found or expired.
	 */
	async getLinkMeta(linkId: string) {
		const link = await prisma.documentLink.findUnique({
			where: { documentLinkId: linkId },
			include: { document: true },
		});
		if (!link) throw new ServiceError('Link not found', 404);
		if (link.expirationTime && new Date(link.expirationTime) <= new Date()) {
			throw new ServiceError('Link is expired', 410);
		}

		const baseMeta = {
			isPasswordProtected: !!link.password,
			visitorFields: link.visitorFields as string[],
		};

		// Public + no gate ⇒ include signed URL & file meta for instant display
		if (link.isPublic && baseMeta.visitorFields.length === 0) {
			const { signedUrl, fileName, size, fileType, documentId } = await this.getSignedFileFromLink(
				link.documentLinkId,
			);

			return { ...baseMeta, signedUrl, fileName, size, fileType, documentId };
		}

		return baseMeta;
	},

	/**
	 * Retrieves a user's contacts based on unique visitor e-mails across all their links.
	 * Each contact includes the most recent name, last viewed link, last activity, and total visits.
	 *
	 * @param userId - The unique identifier of the user.
	 * @returns An array of contact objects with name, email, last viewed link, last activity, and total visits.
	 */
	async getUserContacts(userId: string) {
		// Get all link IDs created by the user
		const links = await prisma.documentLink.findMany({
			where: { createdByUserId: userId },
			select: { documentLinkId: true },
		});
		if (!links.length) return [];

		const linkIds = links.map((l) => l.documentLinkId);

		// Group visitors by email, get visit count and last activity
		const visitors = await prisma.documentLinkVisitor.groupBy({
			by: ['email'],
			where: { documentLinkId: { in: linkIds } },
			_count: { email: true },
			_max: { updatedAt: true },
		});

		// For each unique email, fetch the most recent name and last viewed link
		const details = await Promise.all(
			visitors.map(async (v) => {
				const last = await prisma.documentLinkVisitor.findFirst({
					where: {
						email: v.email,
						documentLinkId: { in: linkIds },
						OR: [{ firstName: { not: '' } }, { lastName: { not: '' } }],
					},
					orderBy: { updatedAt: 'desc' },
					include: { documentLink: true },
				});
				if (!last) return null;

				const first = last.firstName?.trim() || '';
				const lastName = last.lastName?.trim() || '';
				const name = first || lastName ? `${first} ${lastName}`.trim() : null;

				return {
					id: last.id,
					name,
					email: v.email,
					lastViewedLink:
						last.documentLink?.alias || buildDocumentLinkUrl(last.documentLink?.documentLinkId),
					lastActivity: last.updatedAt,
					totalVisits: v._count.email,
				};
			}),
		);

		// Filter out contacts without both email and name
		return details.filter((c) => c && c.email && c.name);
	},
};
