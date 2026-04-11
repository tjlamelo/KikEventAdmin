import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="wrap">
      <div class="ke-card box">
        <h1>Accès refusé</h1>
        <p>Le compte connecté n’a pas le rôle <strong>ADMIN</strong>.</p>
        <button type="button" class="ke-btn ke-btn-primary" (click)="auth.logout()">
          Changer de compte
        </button>
        <p class="muted"><a routerLink="/dashboard">Retour</a> (sera bloqué si non admin)</p>
      </div>
    </div>
  `,
  styles: `
    .wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .box {
      max-width: 420px;
      text-align: center;
    }
    h1 {
      margin: 0 0 8px;
    }
    .muted {
      margin-top: 16px;
      font-size: 13px;
      color: var(--ke-muted);
    }
  `
})
export class UnauthorizedComponent {
  readonly auth = inject(AuthService);
}
