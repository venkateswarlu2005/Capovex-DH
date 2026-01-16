import { FileType } from '@/shared/config/fileIcons';
import { LinkDetailRow } from './linkModels';
import { DocumentQuickStats } from './analyticsModels';

/**
 * Represents a document stored in the system.
 */
export interface DocumentType {
	documentId: string; // The unique DB identifier (cuid)
	fileName: string;
	filePath: string;
	fileType: FileType;
	size: number;
	createdAt: string; // ISO string
	updatedAt: string; // ISO string
	uploader: {
		name: string;
		avatar: string | null;
	};
	stats: DocumentQuickStats;
	createdLinks?: LinkDetailRow[]; // If you want to store link details
}
