import { NextRequest, NextResponse } from 'next/server';

import { analyticsService, createErrorResponse, documentService } from '@/services';
import { authService } from '@/services/auth/authService';

import { AnalyticsPeriodSchema } from '@/shared/validation/analyticsSchemas';

/**
 * GET /api/documents/[documentId]/analytics
 * Returns analytics for a single doc.
 */
export async function GET(req: NextRequest, props: { params: Promise<{ documentId: string }> }) {
	try {
		const userId = await authService.authenticate();
		const { documentId } = await props.params;

		const periodParam = AnalyticsPeriodSchema.catch('all').parse(
			req.nextUrl.searchParams.get('period') ?? 'all',
		);

		// Ownership guard
		await documentService.verifyOwnership(userId, documentId);

		const data = await analyticsService.getDocumentAnalytics(documentId, periodParam);
		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error while fetching analytics.', 500, error);
	}
}
