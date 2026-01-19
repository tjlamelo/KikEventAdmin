import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserHelper } from '../helpers/user';

@Injectable({
  providedIn: 'root'
})
export class IsAuthenticateGuard implements CanActivate {
  private readonly router = inject(Router);

  public canActivate(): boolean {
    if (!UserHelper.isConnect()) {
      this.router.navigate(['login']);
      return false;
    } else {
      return true;
    }
  }
}
