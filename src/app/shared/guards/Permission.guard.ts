import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedPermissions = route.data['permissions'] as string[] || [];

    if (!expectedPermissions.length) return true; // pas de permission requise

    const hasPermission = expectedPermissions.some(p => this.auth.hasPermission(p));
    if (hasPermission) return true;

    console.warn('PermissionGuard blocked access, expected permissions:', expectedPermissions);
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
