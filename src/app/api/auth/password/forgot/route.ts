import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

import { authService, systemSettingService } from '@/services';

/** POST /api/auth/password/forgot  { email } */
export async function POST(req: NextRequest) {
	try {
		const { email } = await req.json();
		if (!email) {
			return NextResponse.json({ message: 'Email is required' }, { status: 400 });
		}

		const result = await authService.forgotPassword({ email });
		if (!result.success) {
			return NextResponse.json({ message: result.message }, { status: 400 });
		}

		/* Optional dev helper: show reset link when e‑mails disabled */
		if (process.env.SEND_EMAILS !== 'true' && result.resetToken) {
			const link = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${result.resetToken}`;
			return NextResponse.json(
				{
					success: true,
					message: 'Emails disabled; returning reset link for dev',
					resetLink: link,
				},
				{ status: 201 },
			);
		}

		// Dev helper: surface the link when Brevo is not configured
		const brevoCfg = await systemSettingService.getBrevoConfig();
		if (!brevoCfg && result.resetToken) {
			const link = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${result.resetToken}`;
			return NextResponse.json(
				{
					success: true,
					message: 'Brevo not configured; returning reset link for dev',
					resetLink: link,
				},
				{ status: 201 },
			);
		}

		return NextResponse.json({ message: result.message }, { status: 201 });
	} catch (err) {
		logError('[forgot]', err);
		return NextResponse.json({ message: 'Server error' }, { status: 500 });
	}
}
