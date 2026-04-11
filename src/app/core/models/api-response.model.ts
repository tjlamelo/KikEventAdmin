/**
 * Aligné sur BaseResponse backend (README KikEventBackend).
 */
export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
}

/** Réponse GET /admin/users — data.users (pas de pagination Spring Data Page). */
export interface AdminUsersListData {
  users: unknown[];
}
