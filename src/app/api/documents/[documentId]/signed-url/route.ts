import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // Import getServerSession
import { authOptions } from '@/lib/authOptions'; // Import authOptions

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
		// 1. Get Session directly to access the correct Primary Key (CUID)
		const session = await getServerSession(authOptions);

		// 2. Validate Session
		if (!session?.user?.id) {
			return createErrorResponse('Unauthorized', 401);
		}

		// 3. Use 'id' (CUID), NOT 'userId' (UUID), for database operations
		const userId = session.user.id;
		const { documentId } = await params;

		const signedUrl = await documentService.getAuthorizedSignedUrl(userId, documentId);

		return NextResponse.json({ signedUrl }, { status: 200 });
	} catch (err) {
		const status = (err as any)?.status ?? 500;
		const message =
			status === 404 ? 'Document not found or access denied.' : 'Failed to generate signed URL.';
		return createErrorResponse(message, status, err);
	}
}