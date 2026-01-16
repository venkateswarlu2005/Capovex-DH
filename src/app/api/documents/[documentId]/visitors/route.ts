import { NextRequest, NextResponse } from 'next/server';

import { createErrorResponse, documentService } from '@/services';
import { authService } from '@/services/auth/authService';

/**
 * GET /api/documents/[documentId]/visitors
 * Lists visitors across all links for a doc.
 */
export async function GET(req: NextRequest, props: { params: Promise<{ documentId: string }> }) {
	try {
		const userId = await authService.authenticate();
		const { documentId } = await props.params;
		const linkVisitors = await documentService.getDocumentVisitors(userId, documentId);
		if (linkVisitors === null) {
			return createErrorResponse('Document not found or access denied.', 404);
		}

		if (linkVisitors.length === 0) {
			return NextResponse.json({ visitors: [] }, { status: 200 });
		}

		const visitors = linkVisitors.map((visitor) => ({
			id: visitor.id,
			documentId: documentId,
			name: `${visitor.firstName} ${visitor.lastName}`.trim(),
			email: visitor.email,
			lastActivity: visitor.updatedAt,
			downloads: 0,
			views: 0,
		}));

		return NextResponse.json({ visitors }, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error while fetching visitors.', 500, error);
	}
}
