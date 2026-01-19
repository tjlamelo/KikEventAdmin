import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserHelper } from '../helpers/user';

@Injectable({
  providedIn: 'root',
})
export class IsGuestGuard implements CanActivate {
  private readonly router = inject(Router);

  canActivate(): boolean {
    if (UserHelper.isConnect()) {
      console.info('IsGuestGuard blocked access, user already connected');
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
