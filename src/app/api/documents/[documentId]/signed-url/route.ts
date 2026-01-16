import { NextRequest, NextResponse } from 'next/server';

import { authService } from '@/services/auth/authService';
import { documentService, createErrorResponse } from '@/services';

/**
 * GET /api/documents/[documentId]/signed-url
 * Returns a user-scoped, short-lived signed URL for the requested document.
 */
export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ documentId: string }> },
) {
	try {
		const userId = await authService.authenticate();
		const { documentId } = await params;

		const signedUrl = await documentService.getSignedUrlForOwner(userId, documentId);

		return NextResponse.json({ signedUrl }, { status: 200 });
	} catch (err) {
		// ServiceError already carries status; default to 500 otherwise
		const status = (err as any)?.status ?? 500;
		const message =
			status === 404 ? 'Document not found or access denied.' : 'Failed to generate signed URL.';
		return createErrorResponse(message, status, err);
	}
}
