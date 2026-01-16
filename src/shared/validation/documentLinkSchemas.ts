import { z } from 'zod';

import { visitorFieldKeys } from '@/shared/config/visitorFieldsConfig';

/* -------------------------------------------------------------------------- */
/*  UI-level schema – used by react-hook-form                                 */
/* -------------------------------------------------------------------------- */

/** Allowed visitor-field keys (config lists only name & email) */
const VisitorFieldEnum = z.enum(visitorFieldKeys);

export const EmailName = z.object({
	email: z.string().email('Invalid e-mail'),
	name: z.string().trim().optional(), // John Doe (optional)
});

/** UI helper (chip / dropdown) */
const ContactOption = EmailName.extend({
	id: z.number().optional(), // Autocomplete bookkeeping
	label: z.string().optional(), // "<name> <email>" for display
});

/**
 * Schema for the document link creation/editing form.
 * Handles alias, public/private, visitor fields, password, expiration, and sharing options.
 * Includes conditional validation for password, expiration, visitor fields, and recipients.
 */
export const DocumentLinkFormSchema = z
	.object({
		alias: z
			.string()
			.trim()
			.max(255, 'Max 255 characters') // alias is *optional*
			.optional()
			.default(''),

		isPublic: z.boolean().default(false),

		/* visitor info */
		requireUserDetails: z.boolean().default(false),
		visitorFields: z.array(VisitorFieldEnum).default([]),

		/* password */
		requirePassword: z.boolean().default(false),
		password: z.string().optional().default(''),

		/* expiration */
		expirationEnabled: z.boolean().default(false),
		expirationTime: z.string().optional().default(''),

		/* e-mail sharing */
		selectFromContact: z.boolean().default(false),
		contactEmails: z.array(ContactOption).default([]),

		sendToOthers: z.boolean().default(false),
		otherEmails: z.array(z.string().email()).default([]),
	})
	/**
	 * Conditional validation rules for the document link form.
	 * - Password: If required, must be at least 5 characters.
	 * - Expiration: If enabled, expiration time must be provided.
	 * - Visitor fields: If required, at least one must be selected.
	 * - Contact emails: If selected, at least one must be provided.
	 * - Other emails: If sending to others, must not be empty.
	 */
	.superRefine((val, ctx) => {
		/* password gate */
		if (val.requirePassword && val.password.trim().length < 5) {
			ctx.addIssue({
				path: ['password'],
				code: z.ZodIssueCode.too_small,
				type: 'string',
				minimum: 5,
				inclusive: true,
				message: 'Password must be at least 5 characters',
			});
		}

		/* expiration gate */
		if (val.expirationEnabled && !val.expirationTime) {
			ctx.addIssue({
				path: ['expirationTime'],
				code: z.ZodIssueCode.custom,
				message: 'Expiration date is required',
			});
		}

		/* visitor-details gate */
		if (val.requireUserDetails && val.visitorFields.length === 0) {
			ctx.addIssue({
				path: ['visitorFields'],
				code: z.ZodIssueCode.too_small,
				minimum: 1,
				type: 'array',
				inclusive: true,
				message: 'Select at least one visitor field',
			});
		}

		/* contact list gate */
		if (val.selectFromContact && val.contactEmails.length === 0) {
			ctx.addIssue({
				path: ['contactEmails'],
				code: z.ZodIssueCode.too_small,
				minimum: 1,
				type: 'array',
				inclusive: true,
				message: 'Choose at least one contact',
			});
		}

		/* send-to-others gate */
		if (val.sendToOthers && val.otherEmails.length === 0) {
			ctx.addIssue({
				path: ['otherEmails'],
				code: z.ZodIssueCode.too_small,
				minimum: 1,
				type: 'array',
				inclusive: true,
				message: 'E-mail list cannot be empty',
			});
		}
	});

/* -------------------------------------------------------------------------- */
/*  Defaults Values                                                           */
/* -------------------------------------------------------------------------- */
/**
 * Default values for the document link form.
 */
export const documentLinkDefaults: z.infer<typeof DocumentLinkFormSchema> =
	DocumentLinkFormSchema.safeParse({}).success
		? (DocumentLinkFormSchema.parse({}) as any)
		: ({} as any);

/* -------------------------------------------------------------------------- */
/*  Payload schema sent to backend                                            */
/* -------------------------------------------------------------------------- */
/**
 * Transforms the form payload into a backend-ready payload.
 * - Extracts and deduplicates recipients from contact picker and free-text.
 * - Includes only relevant fields for backend processing.
 */
export const DocumentLinkPayloadSchema = DocumentLinkFormSchema.transform((payload) => {
	const linkRecipients: { email: string; name?: string }[] = [];

	/* extract from contact picker */
	if (payload.selectFromContact) {
		payload.contactEmails.forEach((c) =>
			linkRecipients.push({ email: c.email, name: c.name?.trim() || undefined }),
		);
	}

	/* extract from free-text */
	if (payload.sendToOthers && payload.otherEmails) {
		linkRecipients.push(...payload.otherEmails.map((email) => ({ email })));
	}

	/* dedupe + final sanitise */
	const filteredLinkRecipients = Array.from(
		new Map(linkRecipients.map((r) => [r.email.toLowerCase(), r])).values(),
	);

	const validationPayload: Record<string, unknown> = {
		alias: payload.alias,
		isPublic: payload.isPublic,

		expirationEnabled: payload.expirationEnabled,
		expirationTime: payload.expirationTime,

		requirePassword: payload.requirePassword,
		password: payload.password,

		requireUserDetails: payload.requireUserDetails,
		visitorFields: payload.visitorFields,

		recipients: filteredLinkRecipients,

		contactEmails: payload.contactEmails,
		otherEmails: payload.otherEmails,
	};

	return validationPayload;
});

export const DocumentLinkCreateSchema = z
	.object({
		alias: z.string().max(255).optional(),

		isPublic: z.boolean(),

		expirationEnabled: z.boolean(),
		expirationTime: z.string().optional(),

		requirePassword: z.boolean(),
		password: z.string().optional(),

		requireUserDetails: z.boolean(),
		visitorFields: z.array(VisitorFieldEnum).optional(),

		recipients: z.array(EmailName).default([]),

		contactEmails: z.array(ContactOption).default([]),
		otherEmails: z.array(z.string().email()).default([]),
	})
	.strict();

/** Type for document link form values */
export type DocumentLinkFormValues = z.infer<typeof DocumentLinkFormSchema>;
/** Type for backend payload for document link */
export type DocumentLinkPayload = z.infer<typeof DocumentLinkPayloadSchema>;
/** Type for document link creation payload */
export type DocumentLinkCreatePayload = z.infer<typeof DocumentLinkCreateSchema>;
/** Type for contact options in the form */
export type ContactOption = z.infer<typeof ContactOption>;
