import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./views/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./views/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent)
  },
  {
    path: '',
    loadComponent: () => import('./views/layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./views/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./views/users/users.component').then((m) => m.UsersComponent)
      },
      {
        path: 'organizer-requests',
        loadComponent: () =>
          import('./views/organizer-requests/organizer-requests.component').then(
            (m) => m.OrganizerRequestsComponent
          )
      },
      { path: 'profiles', redirectTo: 'users', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
