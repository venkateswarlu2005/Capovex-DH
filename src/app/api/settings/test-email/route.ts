import { NextRequest, NextResponse } from 'next/server';

import { systemSettingService, createErrorResponse } from '@/services';
import { authService } from '@/services/auth/authService';

import { TestEmailSchema } from '@/shared/validation/settingSchemas';

/**
 * Handles POST requests to /api/settings/test-email.
 *
 * Sends a test email using the configured system settings.
 *
 * @param req - The incoming Next.js request object.
 * @returns A JSON response indicating success or failure.
 * @throws 401 if the user is not authenticated.
 * @throws 400 if input validation fails.
 */
export async function POST(req: NextRequest) {
	try {
		await authService.authenticate();

		const body = TestEmailSchema.parse(await req.json());
		await systemSettingService.sendTestEmail(body);

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (err: any) {
		if (err?.status && typeof err.status === 'number') {
			return createErrorResponse(err.message, err.status);
		}
		if (err?.name === 'ZodError') {
			return NextResponse.json(
				{ message: 'Invalid input', errors: err.flatten() },
				{ status: 400 },
			);
		}
		return createErrorResponse('Failed to send test email.', 500, err);
	}
}
