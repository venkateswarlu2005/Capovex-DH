/* -------------------------------------------------------------------------- */
/*  Profile API DTOs                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Profile data transfer object (DTO) for user profile.
 */
export interface ProfileDto {
    email: string;
    firstName: string;
    lastName: string;
}

/* ---------- PATCH /api/profile/name ---------- */

/**
 * Request payload for updating user name.
 */
export interface UpdateNameRequest {
    firstName: string;
    lastName: string;
}

/**
 * Response payload for updating user name.
 */
export interface UpdateNameResponse {
    success: boolean;
    message: string;
}

/* ---------- PATCH /api/profile/password ---------- */

/**
 * Request payload for updating user password.
 */
export interface UpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * Response payload for updating user password.
 */
export interface UpdatePasswordResponse {
    success: boolean;
    message: string;
}
