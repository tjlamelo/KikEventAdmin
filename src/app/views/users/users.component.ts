import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { KikeventApiService } from '../../core/services/kikevent-api.service';
import { normalizeRoles } from '../../core/auth/auth.models';

type UserRow = Record<string, unknown>;

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private readonly api = inject(KikeventApiService);

  readonly rows = signal<UserRow[]>([]);
  readonly loading = signal(true);
  readonly err = signal('');
  readonly busyId = signal<number | null>(null);

  readonly roles = ['PARTICIPANT', 'ORGANIZER', 'ADMIN', 'CONTROLER'] as const;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.err.set('');
    this.api.listAdminUsers().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.status !== 200) {
          this.err.set(res.message || 'Erreur');
          return;
        }
        const users = (res.data?.users ?? []) as UserRow[];
        this.rows.set(users);
      },
      error: (e: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.err.set(e?.error?.message ?? 'Chargement impossible');
      }
    });
  }

  displayRoles(row: UserRow): string {
    return normalizeRoles(row['roles']).join(', ') || '—';
  }

  toggleEnabled(row: UserRow): void {
    const id = Number(row['id']);
    const enabled = !Boolean(row['enabled']);
    this.busyId.set(id);
    this.api.updateAdminUserStatus(id, { enabled }).subscribe({
      next: (r) => {
        this.busyId.set(null);
        if (r.status === 200) this.load();
        else alert(r.message);
      },
      error: () => {
        this.busyId.set(null);
        alert('Échec');
      }
    });
  }

  resetPassword(row: UserRow): void {
    const id = Number(row['id']);
    const pwd = window.prompt('Nouveau mot de passe (min. 8 caractères)', '');
    if (pwd === null) return;
    if (pwd.length < 8) {
      alert('Mot de passe trop court');
      return;
    }
    this.busyId.set(id);
    this.api.adminResetUserPassword(id, { newPassword: pwd }).subscribe({
      next: (r) => {
        this.busyId.set(null);
        alert(r.status === 200 ? r.message : r.message);
      },
      error: () => {
        this.busyId.set(null);
        alert('Échec');
      }
    });
  }

  assignRole(row: UserRow, roleName: string): void {
    const id = Number(row['id']);
    if (!roleName) return;
    this.busyId.set(id);
    this.api.assignAdminUserRole(id, { roleName }).subscribe({
      next: (r) => {
        this.busyId.set(null);
        if (r.status === 200) this.load();
        else alert(r.message);
      },
      error: () => {
        this.busyId.set(null);
        alert('Échec');
      }
    });
  }

  asDate(value: unknown): string | number | Date | null {
    if (value == null) return null;
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
      return value;
    }
    return null;
  }

  removeRole(row: UserRow, roleName: string): void {
    const id = Number(row['id']);
    if (!roleName) return;
    this.busyId.set(id);
    this.api.removeAdminUserRole(id, { roleName }).subscribe({
      next: (r) => {
        this.busyId.set(null);
        if (r.status === 200) this.load();
        else alert(r.message);
      },
      error: () => {
        this.busyId.set(null);
        alert('Échec');
      }
    });
  }
}
