import { logWarn } from '@/lib/logger';
import { systemSettingService } from '@/services';

import { BaseAdapter } from './BaseAdapter';
import { BrevoAdapter } from './BrevoAdapter';
import { DevAdapter } from './DevAdapter';
import { TransactionalMail } from './emailUtils';

/**
 * E‑mail service that resolves the concrete adapter at call-time based on current SystemSetting.
 * Uses Brevo (formerly Sendinblue) for production, falls back to DevAdapter if disabled.
 */
class EmailService extends BaseAdapter {
	private cachedSig = ''; // simple signature of last config
	private cachedEmailAdapter: BaseAdapter | null = null;

	/**
	 * Resolves the appropriate email adapter based on the current system settings.
	 * Uses BrevoAdapter if notifications are enabled and configured, otherwise uses DevAdapter.
	 * Caches the adapter instance for efficiency, reusing it if the config signature is unchanged.
	 *
	 * @returns The resolved BaseAdapter instance.
	 */
	private async resolveAdapter(): Promise<BaseAdapter> {
		const brevoConfig = await systemSettingService.getBrevoConfig();

		if (!brevoConfig) {
			logWarn('[emailService] Brevo not configured – using DevAdapter.');
			return new DevAdapter();
		}

		// Build a signature hash; if unchanged reuse cached adapter
		// Hash the API key for security - avoid storing raw credentials in memory
		const hash = (str: string) => {
			let h = 0;
			for (let i = 0; i < str.length; i++) {
				h = ((h << 5) - h + str.charCodeAt(i)) | 0;
			}
			return h.toString(36);
		};
		const sig = `${hash(brevoConfig.apiKey)}:${brevoConfig.fromName}:${brevoConfig.fromEmail}`;
		if (sig === this.cachedSig && this.cachedEmailAdapter) return this.cachedEmailAdapter;

		const adapter = new BrevoAdapter(brevoConfig);
		this.cachedSig = sig;
		this.cachedEmailAdapter = adapter;
		return adapter;
	}

	/**
	 * Sends a transactional email using the resolved adapter.
	 *
	 * @param mail - The transactional mail object containing recipient, subject, and content.
	 * @returns A promise that resolves when the email is sent.
	 */
	async sendTransactional(mail: TransactionalMail) {
		const adapter = await this.resolveAdapter();
		await adapter.sendTransactional(mail);
	}
}

/**
 * Singleton e‑mail service used throughout the app.
 * Automatically resolves the correct adapter for sending emails.
 */
export const emailService: BaseAdapter = new EmailService();
