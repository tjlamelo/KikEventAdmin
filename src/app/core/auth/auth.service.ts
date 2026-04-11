import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { KikeventApiService } from '../services/kikevent-api.service';
import { KIKEVENT_ADMIN_TOKEN_KEY, KIKEVENT_ADMIN_USER_KEY } from './auth.constants';
import { AuthUser, mapMeToAuthUser } from './auth.models';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(KikeventApiService);
  private readonly router = inject(Router);

  readonly user = signal<AuthUser | null>(null);

  constructor() {
    const raw = localStorage.getItem(KIKEVENT_ADMIN_USER_KEY);
    if (raw) {
      try {
        this.user.set(JSON.parse(raw) as AuthUser);
      } catch {
        localStorage.removeItem(KIKEVENT_ADMIN_USER_KEY);
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem(KIKEVENT_ADMIN_TOKEN_KEY);
  }

  hasRole(role: string): boolean {
    const r = role.trim().toUpperCase();
    return (this.user()?.roles ?? []).some((x) => x.toUpperCase() === r);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  private persistUser(u: AuthUser): void {
    this.user.set(u);
    localStorage.setItem(KIKEVENT_ADMIN_USER_KEY, JSON.stringify(u));
  }

  clearSession(): void {
    localStorage.removeItem(KIKEVENT_ADMIN_TOKEN_KEY);
    localStorage.removeItem(KIKEVENT_ADMIN_USER_KEY);
    this.user.set(null);
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate(['/login']);
  }

  /** Recharge /me (ex. après F5). */
  hydrate(): Observable<boolean> {
    const token = this.getToken();
    if (!token) return of(false);
    return this.api.getMe().pipe(
      map((res: ApiResponse<unknown>) => {
        if (res.status !== 200 || !res.data) return false;
        const u = mapMeToAuthUser(res.data as Record<string, unknown>);
        this.persistUser(u);
        return true;
      }),
      catchError(() => of(false))
    );
  }

  login(email: string, password: string): Observable<boolean> {
    return this.api.login({ email, password }).pipe(
      switchMap((res: ApiResponse<unknown>) => {
        if (res.status !== 200 || !res.data) {
          return throwError(() => new Error(res.message || 'Connexion refusée'));
        }
        const d = res.data as Record<string, unknown>;
        const token = d['access_token'];
        if (typeof token !== 'string' || !token.length) {
          return throwError(() => new Error('Réponse sans token'));
        }
        localStorage.setItem(KIKEVENT_ADMIN_TOKEN_KEY, token);
        return this.api.getMe();
      }),
      switchMap((meRes: ApiResponse<unknown>) => {
        if (meRes.status !== 200 || !meRes.data) {
          return throwError(() => new Error(meRes.message || 'Impossible de charger le profil'));
        }
        const u = mapMeToAuthUser(meRes.data as Record<string, unknown>);
        this.persistUser(u);
        return of(true);
      }),
      tap(() => {
        void this.router.navigate(['/dashboard']);
      }),
      catchError((err: unknown) => {
        this.clearSession();
        return throwError(() => err);
      })
    );
  }
}
