import type { UserRole } from '@prisma/client';

/* -------------------------------------------------------------------------- */
/*  Auth API DTOs and Types                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Request payload for user registration (sign-up).
 */
export interface SignUpRequest {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role?: UserRole;
}

/**
 * Response payload for user registration (sign-up).
 */
export interface SignUpResponse {
	success: boolean;
	message: string;
	userId?: string;
}

/**
 * Request payload for user sign-in.
 */
export interface SignInRequest {
	email: string;
	password: string;
	remember: boolean;
}

/**
 * Response payload for user sign-in.
 */
export interface SignInResponse {
	success: boolean;
	message?: string;
	url: string | null;
}

/**
 * Request payload for forgot password.
 */
export interface ForgotPasswordRequest {
	email: string;
}

/**
 * Response payload for forgot password.
 */
export interface ForgotPasswordResponse {
	success: boolean;
	message: string;
	resetToken?: string;
}

/**
 * Request payload for resetting password.
 */
export interface ResetPasswordRequest {
	token: string;
	newPassword: string;
}

/**
 * Response payload for resetting password.
 */
export interface ResetPasswordResponse {
	success: boolean;
	message: string;
}

/**
 * Request payload for changing password.
 */
export interface ChangePasswordRequest {
	email: string;
	currentPassword: string;
	newPassword: string;
}

/**
 * Response payload for changing password.
 */
export interface ChangePasswordResponse {
	success: boolean;
	message: string;
}

/**
 * Request payload for changing user name.
 */
export interface ChangeNameRequest {
	userId: string;
	payload: {
		firstName?: string;
		lastName?: string;
	};
}

/**
 * Response payload for changing user name.
 */
export interface ChangeNameResponse {
	success: boolean;
	message: string;
}

/**
 * Request payload for verifying a user (e.g., email verification).
 */
export interface VerifyUserRequest {
	token?: string;
}

/**
 * Response payload for verifying a user.
 */
export interface VerifyUserResponse {
	success: boolean;
	message: string;
	statusCode: number;
}
