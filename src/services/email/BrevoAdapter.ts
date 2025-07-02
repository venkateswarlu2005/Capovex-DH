import axios from 'axios';

import { logWarn } from '@/lib/logger';

import { BaseAdapter } from './BaseAdapter';
import { type TransactionalMail } from './emailUtils';

type BrevoConfig = { apiKey: string; fromName: string; fromEmail: string };

const API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Adapter for sending transactional emails via Brevo (formerly Sendinblue).
 * Requires an API key and sender identity to be configured.
 */
export class BrevoAdapter extends BaseAdapter {
	private apiKey: string;
	private fromName: string;
	private fromEmail: string;

	constructor({ apiKey, fromName, fromEmail }: BrevoConfig) {
		super();
		this.apiKey = apiKey;
		this.fromName = fromName;
		this.fromEmail = fromEmail;
	}

	/**
	 * Sends the e‑mail via Brevo’s SMTP API.
	 *
	 * @param mail The fully‑rendered mail object.
	 */
	async sendTransactional(mail: TransactionalMail): Promise<void> {
		if (!this.apiKey || !this.fromName || !this.fromEmail) {
			logWarn('[BrevoAdapter] Missing email configuration. Skipping send.');
			return;
		}

		try {
			await axios.post(
				API_URL,
				{
					sender: { name: this.fromName, email: this.fromEmail },
					to: [{ email: mail.to }],
					subject: mail.subject,
					htmlContent: mail.html,
					textContent: mail.text,
				},
				{
					headers: {
						'api-key': this.apiKey,
						'Content-Type': 'application/json',
					},
				},
			);
		} catch (err) {
			logWarn('[BrevoAdapter] Failed to send email:', err instanceof Error ? err.message : err);
		}
	}
}
