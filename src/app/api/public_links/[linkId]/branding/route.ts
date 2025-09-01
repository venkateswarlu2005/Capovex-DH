import { NextRequest, NextResponse } from 'next/server';

import { createErrorResponse, brandingSettingService, linkService } from '@/services';

/**
 * GET /api/public_links/[linkId]/branding
 *
 * Returns minimal branding data for the public “Document Access” page.
 * • Validates link & expiry via linkService.getLinkMeta (throws if invalid)
 * • Fetches the owner’s BrandingSetting row
 * • Signs the stored logo reference (Supabase) ⟶ time-limited URL
 */
export async function GET(_req: NextRequest, { params }: { params: { linkId: string } }) {
	try {
		const { linkId } = params;
		if (!linkId) return createErrorResponse('Link ID is required.', 400);

		/* ---------- link & owner ---------- */
		const { ownerId } = await linkService.getLinkMeta(linkId);

		/* ---------- branding row ---------- */
		const setting = await brandingSettingService.getBrandingSettings(ownerId);
		const logoUrl = await brandingSettingService.getSignedLogoUrl(setting.logoUrl);
		const displayName = await brandingSettingService.getDisplayName(ownerId);

		/* ---------- payload ---------- */
		return NextResponse.json(
			{
				message: 'Success',
				data: {
					themePreset: setting.themePreset, // null ⇒ use primaryColor
					primaryColor: setting.primaryColor,
					bgPreset: setting.bgPreset, // always sent; presets ignore it
					logoUrl, // signed URL | null
					displayName, // null if user hid personal info
				},
			},
			{
				status: 200,
				headers: {
					'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
				},
			},
		);
	} catch (err) {
		return createErrorResponse('Failed to fetch branding.', 500, err);
	}
}
