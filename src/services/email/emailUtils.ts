import { render } from '@react-email/render';
import { createElement, type FC, type ReactElement } from 'react';

import * as ResetPasswordTemplate from './templates/ResetPasswordEmail';
import * as InvitationTemplate from './templates/InvitationEmail';
import * as ViewNotificationTemplate from './templates/ViewNotificationEmail';
import * as VerificationTemplate from './templates/VerificationEmail';
import * as ShareLinkTemplate from './templates/ShareLinkEmail';
import { buildResetPasswordUrl, buildVerificationUrl } from '@/shared/utils';

/**
 * Represents a React email template module with metadata.
 */
export interface TemplateModule<Props = unknown> {
	default: FC<Props>;
	subject: string;
	label?: string;
}

/**
 * Represents a fully rendered transactional e-mail.
 */
export type TransactionalMail = {
	to: string;
	subject: string;
	html: string;
	text: string;
	label?: string;
};

/**
 * Renders a ReactEmail component to HTML or plain-text.
 *
 * @param component - The JSX element to render.
 * @param plainText - When `true`, returns a plain-text version.
 * @returns The rendered string.
 */
async function renderTemplate(component: ReactElement, plainText = false): Promise<string> {
	return render(component, { pretty: true, plainText });
}

/**
 * Builds a {@link TransactionalMail} object for any template.
 *
 * @template Props - Template’s prop shape.
 * @param to       - Target e-mail address.
 * @param template - The template module (component + metadata).
 * @param props    - Props passed into the React component.
 * @returns Transactional mail object.
 */
async function buildEmail<Props>(
	to: string,
	template: TemplateModule<Props>,
	props: Props,
): Promise<TransactionalMail> {
	const element = createElement(template.default as FC<any>, props);

	const html = await renderTemplate(element);
	const text = await renderTemplate(element, true);

	return {
		to,
		subject: template.subject,
		html,
		text,
		label: template.label,
	};
}

/**
 * Builds an account verification e-mail.
 *
 * @param args.to   - Recipient address.
 * @param args.url  - Verification URL (with token embedded).
 * @param args.name - Optional recipient name for personalization.
 * @returns Transactional mail object.
 */
export async function buildVerificationMail(args: {
	to: string;
	url: string;
	name?: string;
}): Promise<TransactionalMail> {
	return buildEmail(args.to, VerificationTemplate, { url: args.url, name: args.name });
}

/**
 * Builds a password reset e-mail.
 *
 * @param args.to  - Recipient address.
 * @param args.url - Password reset URL (with token embedded).
 * @returns Transactional mail object.
 */
export async function buildResetPasswordMail(args: {
	to: string;
	url: string;
}): Promise<TransactionalMail> {
	return buildEmail(args.to, ResetPasswordTemplate, { url: args.url });
}

/**
 * Builds a document shared e-mail (share link).
 *
 * @param args.to            - Recipient's email address.
 * @param args.recipientName - Optional name of the recipient.
 * @param args.senderName    - Name of the user sharing the document.
 * @param args.fileName      - The name of the shared document.
 * @param args.linkUrl       - The URL link to the shared document.
 * @returns Transactional mail object.
 */
export async function buildShareLinkEmail(args: {
	to: string;
	recipientName?: string | null;
	senderName?: string | null;
	fileName: string;
	linkUrl: string;
}): Promise<TransactionalMail> {
	const mailMeta = {
		default: ShareLinkTemplate.ShareLinkEmail,
		subject: ShareLinkTemplate.subject(args.fileName),
		label: ShareLinkTemplate.label,
	};

	return buildEmail(args.to, mailMeta, {
		linkUrl: args.linkUrl,
		fileName: args.fileName,
		recipientName: args.recipientName,
		senderName: args.senderName,
	});
}

/** ---------- Unused Build Functions - Kept for future versions ---------- **/
/**
 * Builds a view notification e-mail.
 *
 * @param args.to           - Recipient's email address.
 * @param args.name         - Optional name of the recipient.
 * @param args.documentName - Name of the viewed document.
 * @param args.viewedAt     - ISO date/time string of when it was viewed.
 * @returns Transactional mail object.
 */
export async function buildViewNotificationMail(args: {
	to: string;
	name?: string;
	documentName: string;
	viewedAt: string;
}): Promise<TransactionalMail> {
	return buildEmail(args.to, ViewNotificationTemplate, {
		name: args.name,
		documentName: args.documentName,
		viewedAt: args.viewedAt,
	});
}

/**
 * Builds an invitation e-mail.
 *
 * @param args.to            - Recipient's email address.
 * @param args.recipientName - Optional recipient name for personalization.
 * @param args.senderName    - Name of the person sending the invitation.
 * @param args.token         - Unique invitation token (embedded in the URL).
 * @returns Transactional mail object.
 */
export async function buildInvitationMail(args: {
	to: string;
	recipientName?: string;
	senderName: string;
	token: string;
}): Promise<TransactionalMail> {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
	const inviteUrl = `${appUrl}/team?token=${args.token}`;

	return buildEmail(args.to, InvitationTemplate, {
		recipientName: args.recipientName,
		senderName: args.senderName,
		inviteUrl,
	});
}
