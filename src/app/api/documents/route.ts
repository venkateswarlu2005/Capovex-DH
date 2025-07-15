import { NextRequest, NextResponse } from 'next/server';

import { createErrorResponse, documentService, storageService } from '@/services';
import { authService } from '@/services/auth/authService';

import { buildDocumentLinkUrl } from '@/shared/utils';

/**
 * GET /api/documents
 * Returns a list of documents for the authenticated user.
 * Each document includes metadata and quick stats.
 */
export async function GET(req: NextRequest) {
	try {
		const userId = await authService.authenticate();
		const documents = await documentService.getUserDocuments(userId);

		return NextResponse.json({ documents }, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error while fetching documents', 500, error);
	}
}

/**
 * POST /api/documents
 * Uploads a new document. Expects form data with "file".
 */
export async function POST(req: NextRequest) {
	try {
		const userId = await authService.authenticate();

		const formData = await req.formData();
		const file = formData.get('file');
		if (!(file instanceof File) || !file.name) {
			return createErrorResponse('Invalid file type or missing file', 400);
		}

		// Validate file with environment constraints
		try {
			await documentService.validateUploadFile(file);
		} catch (err) {
			if (err instanceof Error) {
				if (err.message === 'INVALID_FILE_TYPE') {
					return createErrorResponse('File type not allowed', 400);
				}
				if (err.message === 'FILE_TOO_LARGE') {
					return createErrorResponse('File size exceeds limit', 400);
				}
			}
			return createErrorResponse('File validation failed', 400, err);
		}

		const arrayBuffer = await file.arrayBuffer();
		const fileBuffer = Buffer.from(arrayBuffer);

		const uploadResult = await storageService.uploadFile(fileBuffer, {
			userId,
			fileName: file.name,
			fileType: file.type,
		});
		if (!uploadResult) {
			return createErrorResponse('File upload failed.', 500);
		}

		const document = await documentService.createDocument({
			userId,
			fileName: file.name,
			filePath: uploadResult,
			fileType: file.type,
			size: file.size,
		});

		return NextResponse.json({ message: 'File uploaded successfully', document }, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error while uploading document', 500, error);
	}
}
