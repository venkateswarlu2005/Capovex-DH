/**
 * Business-level notification hub.
 *  ‣ Consumes high-level events (link created, password changed…)
 *  ‣ Delegates rendering to emailService helpers
 *  ‣ Future-proof: easy to swap direct sends for queued jobs or web-hook fan-out
 */

import { emailService } from '@/services/email/emailService';
import { ShareLinkRecipient } from '@/shared/models';

/* -------------------------------------------------------------------------- */
/*  Share-link invitation                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Payload for sending a share-link invitation.
 */
interface ShareLinkPayload {
	recipients: ShareLinkRecipient[]; // validated, unique e-mails
	url: string; // fully-qualified link
	fileName: string;
	senderName?: string | null; // optional, can be null if not set
	recipientName?: string | null; // optional, not currently used
}

/**
 * Sends a “document link shared” e-mail to one or many recipients.
 * De-duplicates and validates e-mails before sending.
 * Currently sends one e-mail per recipient; batching is a future optimization.
 *
 * @param payload - The share link payload containing recipients, link URL, document title, and optional sender name.
 * @returns A promise that resolves when all e-mails have been sent.
 */
async function sendShareLink({
	recipients,
	url,
	fileName,
	senderName,
}: ShareLinkPayload): Promise<void> {
	const uniqueRecipients = Array.from(
		new Map(recipients.map((r) => [r.email.toLowerCase(), r])).values(),
	);
	console.warn('[notificationService] Sending share link emails to:', uniqueRecipients);
	// TODO: If QUEUE_ENABLED, push jobs to queue instead of awaiting each send
	for (const recipient of uniqueRecipients) {
		await emailService.sendShareLinkEmail(
			recipient.email,
			url,
			fileName,
			senderName,
			recipient.name,
		);
	}

	// TODO: When Brevo event ingestion is added, store an EmailPending row here for web-hook integration
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Notification service API exposing business-level notification helpers.
 * Future methods (e.g., sendLinkViewAlert, sendPasswordChanged) can be added here.
 */
export const notificationService = {
	sendShareLink,
	// TODO: add sendLinkViewAlert, sendPasswordChanged, etc.
};
