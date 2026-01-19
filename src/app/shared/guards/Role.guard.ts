import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[] || [];
    
    if (!expectedRoles.length) return true; // pas de rôle requis
    
    const hasRole = expectedRoles.some(role => this.auth.hasRole(role));
    if (hasRole) return true;

    console.warn('RoleGuard blocked access, expected roles:', expectedRoles);
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
