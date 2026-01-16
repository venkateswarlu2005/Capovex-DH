import {
	TransactionalMail,
	buildVerificationMail,
	buildResetPasswordMail,
	buildShareLinkEmail,
	buildInvitationMail,
	buildViewNotificationMail,
} from './emailUtils';

/**
 * Abstract base class for e-mail adapters.
 * Provides a consistent interface for sending transactional e-mails using various templates.
 * Concrete adapters must implement the low-level delivery routine.
 */
export abstract class BaseAdapter {
	/**
	 * Low-level delivery routine implemented by each adapter.
	 * Must send the provided transactional mail using the underlying provider.
	 *
	 * @param mail - Transactional mail object containing all necessary fields.
	 */
	abstract sendTransactional(mail: TransactionalMail): Promise<void>;

	/**
	 * Sends a raw, pre-rendered e-mail object.
	 * Useful for one-off test mails or custom transactional sends.
	 *
	 * @param mail - Transactional mail object containing all necessary fields.
	 */
	async sendRawEmail(mail: TransactionalMail): Promise<void> {
		await this.sendTransactional(mail);
	}

	/**
	 * Sends an account verification e-mail.
	 *
	 * @param to   - Recipient address.
	 * @param url  - Verification URL (with token embedded).
	 * @param name - Optional recipient name.
	 */
	async sendVerificationEmail(to: string, url: string, name?: string): Promise<void> {
		const mail = await buildVerificationMail({ to, url, name });
		await this.sendTransactional(mail);
	}

	/**
	 * Sends a password reset e-mail.
	 *
	 * @param to   - Recipient address.
	 * @param url  - Password reset URL (with token embedded).
	 */
	async sendResetPasswordEmail(to: string, url: string): Promise<void> {
		const mail = await buildResetPasswordMail({ to, url });
		await this.sendTransactional(mail);
	}

	/**
	 * Sends a document shared e-mail (share link).
	 *
	 * @param to            - Recipient email address.
	 * @param linkUrl       - Fully-qualified link URL.
	 * @param fileName      - Human-readable file name.
	 * @param senderName    - Optional name of the user for personal touch.
	 * @param recipientName - Optional recipient name.
	 */
	async sendShareLinkEmail(
		to: string,
		linkUrl: string,
		fileName: string,
		senderName?: string | null,
		recipientName?: string | null,
	): Promise<void> {
		const mail = await buildShareLinkEmail({
			to,
			linkUrl,
			fileName,
			senderName,
			recipientName,
		});

		await this.sendTransactional(mail);
	}

	/** ---------- Unused Send Functions - Kept for future versions ---------- **/

	/**
	 * Sends an invitation e-mail.
	 *
	 * @param to            - Recipient email address.
	 * @param recipientName - Optional recipient name.
	 * @param senderName    - Sender name.
	 * @param token         - Invitation token.
	 */
	async sendInvitationEmail(
		to: string,
		recipientName: string | undefined,
		senderName: string,
		token: string,
	): Promise<void> {
		const mail = await buildInvitationMail({ to, recipientName, senderName, token });
		await this.sendTransactional(mail);
	}

	/**
	 * Sends a view notification e-mail.
	 *
	 * @param to           - Recipient email address.
	 * @param name         - Optional recipient name.
	 * @param documentName - Name of the viewed document.
	 * @param viewedAt     - ISO string of the view timestamp.
	 */
	async sendViewNotificationEmail(
		to: string,
		name: string | undefined,
		documentName: string,
		viewedAt: string,
	): Promise<void> {
		const mail = await buildViewNotificationMail({
			to,
			name,
			documentName,
			viewedAt,
		});
		await this.sendTransactional(mail);
	}
}
