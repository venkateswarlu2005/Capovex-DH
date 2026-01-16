import { NextRequest, NextResponse } from 'next/server';

import { createErrorResponse, linkService } from '@/services';
import { authService } from '@/services/auth/authService';

export async function GET(_req: NextRequest): Promise<NextResponse> {
	try {
		const userId = await authService.authenticate();
		const contacts = await linkService.getUserContacts(userId);

		return NextResponse.json({ data: contacts }, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error.', 500, error);
	}
}
