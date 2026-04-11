import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div class="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 class="text-xl font-bold text-gray-900">Accès refusé</h1>
        <p class="mt-3 text-sm text-gray-600">
          Le compte connecté n’a pas le rôle <strong class="text-gray-900">ADMIN</strong>.
        </p>
        <button
          type="button"
          (click)="auth.logout()"
          class="mt-6 w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Changer de compte
        </button>
        <p class="mt-4 text-xs text-gray-500">
          <a routerLink="/login" class="font-medium text-violet-600 hover:underline">Retour connexion</a>
        </p>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  readonly auth = inject(AuthService);
}
