export { computeExpirationDays, formatDateTime } from './dateUtils';
export type { FormatDateTimeOptions } from './dateUtils';

export {
	downloadFile,
	exportToCsv,
	formatFileSize,
	isViewableFileType,
	parseFileSize,
} from './fileUtils';
export type { FormatFileSizeOptions } from './fileUtils';

export { convertTransparencyToHex, sortFields, splitName } from './stringUtils';

export {
	confirmPasswordRule,
	// getPasswordChecks,
	hasSpecialCharRule,
	minLengthRule,
	passwordValidationRule,
	requiredFieldRule,
	// validateEmails,
	validateEmailsRule,
	validEmailRule,
} from './validators';
export type { ValidationRule } from './validators';

export {
	buildDocumentLinkUrl,
	buildResetPasswordUrl,
	buildVerificationUrl,
} from './urlBuilderUtils';

export { emptyToNull, parseBoolean, dedupeByEmail, handleEmailSelection } from './formDataUtils';

export { PASSWORD_RULES, getPasswordChecks, validateEmails, isValidEmail } from './validationUtils';
