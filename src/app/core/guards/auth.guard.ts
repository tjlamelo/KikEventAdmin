import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.getToken()) {
    return router.parseUrl('/login');
  }
  if (auth.user()) {
    return true;
  }
  return auth.hydrate().pipe(
    take(1),
    map((ok) => (ok ? true : router.parseUrl('/login')))
  );
};
