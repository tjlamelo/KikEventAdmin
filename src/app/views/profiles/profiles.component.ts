import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { KikeventApiService } from '../../core/services/kikevent-api.service';
import { UserProfileRequest } from '../../core/models/kikevent-api-requests.model';

type ProfileRow = Record<string, unknown>;

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.scss'
})
export class ProfilesComponent implements OnInit {
  private readonly api = inject(KikeventApiService);

  readonly rows = signal<ProfileRow[]>([]);
  readonly loading = signal(true);
  readonly err = signal('');
  readonly edit = signal<ProfileRow | null>(null);
  readonly form = signal<UserProfileRequest>({});
  readonly busy = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.err.set('');
    this.api.listAdminProfiles().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.status !== 200) {
          this.err.set(res.message || 'Erreur');
          return;
        }
        const list = (res.data as { profiles?: ProfileRow[] } | undefined)?.profiles ?? [];
        this.rows.set(list);
      },
      error: (e: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.err.set(e?.error?.message ?? 'Chargement impossible');
      }
    });
  }

  openEdit(row: ProfileRow): void {
    this.edit.set(row);
    this.form.set({
      firstName: (row['firstName'] as string) ?? '',
      lastName: (row['lastName'] as string) ?? '',
      avatarUrl: (row['avatarUrl'] as string) ?? '',
      bio: (row['bio'] as string) ?? ''
    });
  }

  closeEdit(): void {
    this.edit.set(null);
  }

  save(): void {
    const row = this.edit();
    if (!row) return;
    const id = Number(row['id']);
    this.busy.set(true);
    this.api.updateAdminProfile(id, this.form()).subscribe({
      next: (r) => {
        this.busy.set(false);
        if (r.status === 200) {
          this.closeEdit();
          this.load();
        } else {
          alert(r.message);
        }
      },
      error: () => {
        this.busy.set(false);
        alert('Échec');
      }
    });
  }

  patchFormField<K extends keyof UserProfileRequest>(key: K, value: string): void {
    this.form.update((prev) => ({ ...prev, [key]: value }));
  }

  asDate(value: unknown): string | number | Date | null {
    if (value == null) return null;
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
      return value;
    }
    return null;
  }

  delete(row: ProfileRow): void {
    const id = Number(row['id']);
    if (!window.confirm('Supprimer ce profil ?')) return;
    this.busy.set(true);
    this.api.deleteAdminProfile(id).subscribe({
      next: (r) => {
        this.busy.set(false);
        if (r.status === 200) {
          this.closeEdit();
          this.load();
        } else {
          alert(r.message);
        }
      },
      error: () => {
        this.busy.set(false);
        alert('Échec');
      }
    });
  }
}
