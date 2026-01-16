import { NextRequest, NextResponse } from 'next/server';

import { systemSettingService, createErrorResponse, authService } from '@/services';
import { SystemSettingsUpdateSchema } from '@/shared/validation/settingSchemas';

/**
 * Handles GET requests to /api/settings/system.
 *
 * Retrieves the authenticated user's system settings.
 *
 * @param req - The incoming Next.js request object.
 * @returns A JSON response containing the user's system settings.
 * @throws 401 if the user is not authenticated.
 * @throws 500 if there is an error fetching the settings.
 */
export async function GET() {
	try {
		await authService.authenticate(); // throws 401 if not signed-in
		const data = await systemSettingService.getSystemSettings();

		return NextResponse.json({ message: 'Success', data }, { status: 200 });
	} catch (err) {
		return createErrorResponse('Failed to fetch system settings.', 500, err);
	}
}

/**
 * Handles PATCH requests to /api/settings/system.
 *
 * Accepts JSON or multipart/form-data for updating system settings.
 * Validates input, updates the system settings, and returns the updated settings.
 *
 * @param req - The incoming Next.js request object.
 * @returns A JSON response containing the updated system settings.
 * @throws 400 if input validation fails.
 * @throws 500 if there is an error updating the settings.
 */
export async function PATCH(req: NextRequest) {
	try {
		await authService.authenticate();

		let raw: any;
		const cType = req.headers.get('content-type') ?? '';

		// Accept either pure-JSON or multipart with a `payload` field.
		if (cType.startsWith('multipart/form-data')) {
			const form = await req.formData();
			raw = JSON.parse((form.get('payload') as string) || '{}');
		} else {
			raw = await req.json();
		}

		const payload = SystemSettingsUpdateSchema.parse(raw);
		const updated = await systemSettingService.updateSystemSettings(payload);

		return NextResponse.json({ message: 'Settings updated', data: updated }, { status: 200 });
	} catch (err: any) {
		if (err?.name === 'ZodError') {
			return NextResponse.json(
				{ message: 'Invalid input', errors: err.flatten() },
				{ status: 400 },
			);
		}
		if (err?.status && typeof err.status === 'number') {
			return createErrorResponse(err.message, err.status);
		}
		return createErrorResponse('Failed to update system settings.', 500, err);
	}
}
