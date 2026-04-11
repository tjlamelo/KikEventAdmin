/** POST /api/v1/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /api/v1/auth/register */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber: number;
}

/** PATCH /api/v1/me/password */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** PATCH /api/v1/admin/users/{id}/status */
export interface AdminUpdateUserStatusRequest {
  enabled: boolean;
}

/** PATCH .../roles/assign | .../roles/remove */
export interface AdminRoleRequest {
  roleName: string;
}

/** PATCH /api/v1/admin/users/{id}/password */
export interface AdminResetPasswordRequest {
  newPassword: string;
}

/** PATCH /api/v1/admin/organizer-requests/{userId}/decision */
export interface AdminOrganizerDecisionRequest {
  approved: boolean;
  rejectionReason?: string | null;
}

/** PUT /api/v1/profiles/me | /api/v1/admin/profiles/{id} */
export interface UserProfileRequest {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
}
