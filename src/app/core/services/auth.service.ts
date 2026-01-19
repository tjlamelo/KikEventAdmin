// src/app/core/services/auth.service.ts
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
 
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Login,LoginReturnType  } from '../models/auth/login.model';
 
import { environment } from '../../../environments/environment.development';
 
export interface AuthUser {
  id: number;
  name: string;
  roles: string[];
  permissions: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private router = inject(Router);
  private readonly URL = '/auth';

  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  public user$ = this.userSubject.asObservable();

  // --------------------------
  // Login
  // --------------------------
  login(data: Login): Observable<LoginReturnType> {
    return this.httpClient
      .post<LoginReturnType>(`${environment.apiUrl}${this.URL}/login`, data)
      .pipe(
        tap((res) => {
          if (res?.code === 200) {
            // charger l'utilisateur connecté après login
         setTimeout(() => this.loadUser(), 100);
            //  console.log(res)
          }
        }),
        catchError((err) => throwError(() => err))
      );
  }
  

  // --------------------------
  // Logout
  // --------------------------
  logout(): void {
    // Ici tu peux ajouter appel API /logout si besoin
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  // --------------------------
  // Charger l'utilisateur connecté (/my-permissions-roles)
  // --------------------------
  loadUser(): void {
    this.httpClient.get<any>(`${environment.apiUrl}/my-permissions-roles`).subscribe({
      next: (res) => {
        if (res?.code === 200) {
          this.userSubject.next(res.data as AuthUser);
        } else {
          this.userSubject.next(null);
        }
      },
      error: () => {
        this.userSubject.next(null);
      },
    });
  }

  // --------------------------
  // Vérification des rôles
  // --------------------------
  hasRole(role: string): boolean {
    const user = this.userSubject.value;
    return !!user?.roles?.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.userSubject.value;
    return roles.some((r) => user?.roles?.includes(r));
  }

  // --------------------------
  // Vérification des permissions
  // --------------------------
hasPermission(permission: string): boolean {
  const user = this.userSubject.value;
  if (!user?.permissions) return false;

  // Comparaison insensible à la casse et aux espaces
  return user.permissions.some(p => p.trim().toLowerCase() === permission.trim().toLowerCase());
}

hasAnyPermission(permissions: string[]): boolean {
  const user = this.userSubject.value;
  if (!user?.permissions) return false;

  return permissions.some(permission =>
    user.permissions.some(p => p.trim().toLowerCase() === permission.trim().toLowerCase())
  );
}

}
