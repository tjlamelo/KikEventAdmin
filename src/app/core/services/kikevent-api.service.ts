import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AdminUsersListData } from '../models/api-response.model';
import {
  AdminOrganizerDecisionRequest,
  AdminResetPasswordRequest,
  AdminRoleRequest,
  AdminUpdateUserStatusRequest,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UserProfileRequest
} from '../models/kikevent-api-requests.model';

/**
 * Client HTTP aligné sur l’OpenAPI déployée et les contrôleurs backend
 * (UserController, UserProfileController, LoginController, RegisterController).
 *
 * Swagger UI : https://api.vps.jbis.cm/swagger-ui/index.html
 *
 * Remarque : il n’existe pas encore sur ce backend de routes type
 * /admin/events, /admin/stats/dashboard, /admin/billing, etc.
 * Les ajouter ici quand elles seront publiées dans la spec.
 */
@Injectable({ providedIn: 'root' })
export class KikeventApiService {
  private readonly http = inject(HttpClient);
  private readonly root = environment.apiUrl;

  // ─── Auth (/api/v1/auth) ───────────────────────────────────────────────

  login(body: LoginRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.root}/auth/login`, body);
  }

  register(body: RegisterRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.root}/auth/register`, body);
  }

  /** URL à ouvrir pour démarrer OAuth2 Google (redirection navigateur). */
  getGoogleOAuthStartUrl(): string {
    return `${this.root}/auth/google`;
  }

  // ─── Moi (/api/v1/me, /profiles/me) ────────────────────────────────────

  getMe(): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(`${this.root}/me`);
  }

  changeMyPassword(body: ChangePasswordRequest): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(`${this.root}/me/password`, body);
  }

  getMyProfile(): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(`${this.root}/profiles/me`);
  }

  updateMyProfile(body: UserProfileRequest): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.root}/profiles/me`, body);
  }

  // ─── Admin — utilisateurs ──────────────────────────────────────────────

  /**
   * GET /admin/users — réponse : data.users (tableau), pas de query page/size côté backend actuel.
   */
  listAdminUsers(): Observable<ApiResponse<AdminUsersListData>> {
    return this.http.get<ApiResponse<AdminUsersListData>>(`${this.root}/admin/users`);
  }

  getAdminUserById(id: number): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(`${this.root}/admin/users/${id}`);
  }

  updateAdminUserStatus(
    id: number,
    body: AdminUpdateUserStatusRequest
  ): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(`${this.root}/admin/users/${id}/status`, body);
  }

  adminResetUserPassword(
    id: number,
    body: AdminResetPasswordRequest
  ): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(`${this.root}/admin/users/${id}/password`, body);
  }

  assignAdminUserRole(id: number, body: AdminRoleRequest): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(
      `${this.root}/admin/users/${id}/roles/assign`,
      body
    );
  }

  removeAdminUserRole(id: number, body: AdminRoleRequest): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(
      `${this.root}/admin/users/${id}/roles/remove`,
      body
    );
  }

  // ─── Admin — demandes organizer ────────────────────────────────────────

  listAdminOrganizerRequests(): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(`${this.root}/admin/organizer-requests`);
  }

  getAdminOrganizerRequestByUserId(userId: number): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(
      `${this.root}/admin/organizer-requests/${userId}`
    );
  }

  decideAdminOrganizerRequest(
    userId: number,
    body: AdminOrganizerDecisionRequest
  ): Observable<ApiResponse<unknown>> {
    return this.http.patch<ApiResponse<unknown>>(
      `${this.root}/admin/organizer-requests/${userId}/decision`,
      body
    );
  }

  // ─── Admin — profils ───────────────────────────────────────────────────

  listAdminProfiles(): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(`${this.root}/admin/profiles`);
  }

  getAdminProfileById(id: number): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(`${this.root}/admin/profiles/${id}`);
  }

  updateAdminProfile(id: number, body: UserProfileRequest): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(`${this.root}/admin/profiles/${id}`, body);
  }

  deleteAdminProfile(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.root}/admin/profiles/${id}`);
  }
}
