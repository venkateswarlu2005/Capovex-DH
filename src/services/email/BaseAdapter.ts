import {
	TransactionalMail,
	buildVerificationMail,
	buildResetPasswordMail,
	buildInvitationMail,
	buildDocumentSharedMail,
	buildViewNotificationMail,
} from './emailUtils';

export abstract class BaseAdapter {
	/**
	 * Low‑level delivery routine implemented by each adapter.
	 */
	abstract sendTransactional(mail: TransactionalMail): Promise<void>;

	/**
	 * Sends an account‑verification e‑mail.
	 *
	 * @param to Recipient address.
	 * @param token Verification token.
	 * @param name Optional recipient name.
	 */
	async sendVerificationEmail(to: string, token: string, name?: string): Promise<void> {
		const mail = await buildVerificationMail({ to, token, name });
		await this.sendTransactional(mail);
	}

	/**
	 * Sends a password‑reset e‑mail.
	 *
	 * @param to Recipient address.
	 * @param token Reset‑password token.
	 */
	async sendResetPasswordEmail(to: string, token: string): Promise<void> {
		const mail = await buildResetPasswordMail({ to, token });
		await this.sendTransactional(mail);
	}

	/**
	 * Sends an invitation e‑mail.
	 *
	 * @param to Recipient email address.
	 * @param recipientName Optional recipient name.
	 * @param senderName Sender name.
	 * @param token Invitation token.
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
	 * Sends a document shared e‑mail.
	 *
	 * @param to Recipient email address.
	 * @param recipientName Optional recipient name.
	 * @param senderName Sender name.
	 * @param documentName Name of the shared document.
	 * @param linkId Document link ID.
	 */
	async sendDocumentSharedEmail(
		to: string,
		recipientName: string | undefined,
		senderName: string,
		documentName: string,
		linkId: string,
	): Promise<void> {
		const mail = await buildDocumentSharedMail({
			to,
			recipientName,
			senderName,
			documentName,
			linkId,
		});
		await this.sendTransactional(mail);
	}

	/**
	 * Sends a view notification e-mail.
	 *
	 * @param to Recipient email address.
	 * @param name Optional recipient name.
	 * @param documentName Name of the viewed document.
	 * @param viewedAt ISO string of the view timestamp.
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
