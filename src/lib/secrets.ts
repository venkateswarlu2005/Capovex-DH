/**
 * secrets.ts
 * ---------------------------------------------------------------------------
 * Tiny AES-256-GCM helper for encrypting / decrypting sensitive secrets
 * persisted in the DB (Brevo API key, etc.).
 * Key material derives from NEXTAUTH_SECRET (already present in every env).
 * ---------------------------------------------------------------------------
 */

import { randomBytes, createCipheriv, createDecipheriv, createHash, CipherGCMTypes } from 'crypto';

const ALG: CipherGCMTypes = 'aes-256-gcm';
const IV_LEN = 12; // 96-bit nonce recommended for GCM

/**
 * Builds a 32-byte symmetric key from NEXTAUTH_SECRET using SHA-256.
 *
 * @returns The derived 32-byte Buffer key.
 * @throws Error if NEXTAUTH_SECRET is not set in the environment.
 */
function getKey(): Buffer {
	const secret = process.env.NEXTAUTH_SECRET;
	if (!secret) throw new Error('NEXTAUTH_SECRET env var is required for encryption.');
	return createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a UTF-8 string using AES-256-GCM and returns a string in the format `iv:tag:cipher` (all hex).
 *
 * @param plain - The plaintext string to encrypt.
 * @returns The encrypted string in `iv:tag:cipher` hex format.
 */
export function encryptSecret(plain: string): string {
	const key = getKey();
	const iv = randomBytes(IV_LEN);

	const cipher = createCipheriv(ALG, key, iv);
	const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();

	return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a payload produced by {@link encryptSecret}.
 *
 * @param payload - The encrypted string in `iv:tag:cipher` hex format.
 * @returns The decrypted plaintext string.
 * @throws SecretDecryptionError if decryption fails or the payload is malformed.
 */
export function decryptSecret(payload: string): string {
	try {
		const [ivHex, tagHex, dataHex] = payload.split(':');
		if (!ivHex || !tagHex || !dataHex) throw new Error('Malformed payload');

		const key = getKey();
		const decipher = createDecipheriv(ALG, key, Buffer.from(ivHex, 'hex'));
		decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

		const decrypted = Buffer.concat([
			decipher.update(Buffer.from(dataHex, 'hex')),
			decipher.final(),
		]);

		return decrypted.toString('utf8');
	} catch (err) {
		throw new SecretDecryptionError(
			err instanceof Error ? err.message : 'Unknown decryption error',
		);
	}
}

/**
 * Typed error for decryption failures (helps route handlers catch).
 */
export class SecretDecryptionError extends Error {
	/**
	 * Constructs a new SecretDecryptionError.
	 *
	 * @param message - The error message describing the decryption failure.
	 */
	constructor(message: string) {
		super(message);
		this.name = 'SecretDecryptionError';
	}
}
