import { VisitorFieldKey } from '../config/visitorFieldsConfig';

/**
 * API response shape for public link metadata.
 */
export interface PublicLinkMetaResponse {
	message: string;
	data: PublicLinkMeta;
}

/**
 * Metadata for a link, including optional instant-view fields.
 */
export interface PublicLinkMeta {
	isPasswordProtected: boolean;
	visitorFields: VisitorFieldKey[];
	ownerId: string;
	signedUrl?: string;
	fileName?: string;
	size?: number;
	fileType?: string;
	documentId?: string;
}

/**
 * Payload for a public link file, including signed URL and file metadata.
 */
export interface PublicLinkFilePayload {
	signedUrl: string;
	fileName: string;
	size: number; // File size in bytes
	fileType: string; // MIME type
	documentId: string;
	documentLinkId?: string; // Optional when not relevant
}

// =========== LINK DETAIL ===========

/**
 * Row representing a document link and its analytics summary.
 */
export interface LinkDetailRow {
	linkId: string;
	alias: string | null;
	documentId: string;
	createdLink: string; // Same as linkUrl
	lastActivity: string; // ISO date string
	linkViews: number; // Aggregated analytics
}

/**
 * Local state stages returned by `useLinkAccess`.
 */
export type LinkAccessState = 'loading' | 'gate' | 'file' | 'error';

// =========== CONTACT DETAIL ===========

/**
 * Contact details derived from link visitor analytics.
 */
export interface Contact {
	id: number;
	name: string; // Combined first + last name
	email: string; // Visitor's email address
	documentId: string; // The documentId from DB
	lastActivity: Date; // Date/time of their last activity
	lastViewedLink: string; // The last link or friendly name they viewed
	totalVisits: number; // Total visits for that email across the user's links
	downloads: number; // Total downloads by this contact
	views: string; // Total Views by this contact
}

// =========== LINK VISITOR DETAIL ===========

/**
 * Visitor record for a specific document link.
 */
export interface LinkVisitor {
	id: number;
	linkId: string;
	name: string;
	email: string;
	visitedAt: string; // ISO date string
	visitorMetaData: string | null; // Optional metadata (e.g., browser info)
}

/**
 * Recipient object for share-link invitations.
 * Contains email and optional name.
 */
export interface ShareLinkRecipient {
	email: string;
	name?: string;
}
