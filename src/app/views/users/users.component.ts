import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { concatMap, forkJoin, from, map } from 'rxjs';
import { KikeventApiService } from '../../core/services/kikevent-api.service';
import { UserProfileRequest } from '../../core/models/kikevent-api-requests.model';
import { normalizeRoles } from '../../core/auth/auth.models';
import { isApiSuccessStatus } from '../../core/admin/api-success';

type UserRow = Record<string, unknown>;
type ProfileRow = Record<string, unknown>;

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  private readonly api = inject(KikeventApiService);

  readonly rows = signal<UserRow[]>([]);
  readonly loading = signal(true);
  readonly err = signal('');
  readonly busyId = signal<number | null>(null);
  /** Retour utilisateur inline (évite les alert() système pour les actions courantes). */
  readonly notice = signal<{ kind: 'ok' | 'err'; text: string } | null>(null);

  readonly roles = ['PARTICIPANT', 'ORGANIZER', 'ADMIN', 'CONTROLER'] as const;

  /** Sélection locale des rôles par utilisateur (préremplie depuis l’API, modifiable avant appliquer). */
  readonly roleDraft = signal<Record<number, string[]>>({});

  /** Ligne dont l’éditeur de rôles (multiselect) est ouvert. */
  readonly roleEditorId = signal<number | null>(null);

  /** Profils admin indexés par id utilisateur (l’API aligne en général profile.id sur user.id). */
  readonly profilesByUserId = signal<Record<number, ProfileRow>>({});

  /** Section profil repliable pour un utilisateur. */
  readonly profileSectionUserId = signal<number | null>(null);

  readonly editProfileRow = signal<ProfileRow | null>(null);
  readonly profileForm = signal<UserProfileRequest>({});
  readonly profileBusy = signal(false);

  private flashNotice(kind: 'ok' | 'err', text: string): void {
    this.notice.set({ kind, text });
    window.setTimeout(() => this.notice.set(null), 5000);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.err.set('');
    forkJoin({
      users: this.api.listAdminUsers(),
      profiles: this.api.listAdminProfiles()
    }).subscribe({
      next: ({ users: usersRes, profiles: profilesRes }) => {
        this.loading.set(false);
        if (usersRes.status !== 200) {
          this.err.set(usersRes.message || 'Erreur');
          this.profilesByUserId.set({});
          return;
        }
        const users = (usersRes.data?.users ?? []) as UserRow[];
        this.rows.set(users);
        this.syncRoleDraftFromRows(users);
        if (profilesRes.status === 200) {
          const list =
            (profilesRes.data as { profiles?: ProfileRow[] } | undefined)?.profiles ?? [];
          this.indexProfiles(list);
        } else {
          this.profilesByUserId.set({});
        }
      },
      error: (e: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.err.set(e?.error?.message ?? 'Chargement impossible');
        this.profilesByUserId.set({});
      }
    });
  }

  private indexProfiles(list: ProfileRow[]): void {
    const map: Record<number, ProfileRow> = {};
    for (const p of list) {
      const uid = Number(p['userId'] ?? p['id']);
      if (!Number.isFinite(uid)) continue;
      map[uid] = p;
    }
    this.profilesByUserId.set(map);
  }

  profileFor(row: UserRow): ProfileRow | undefined {
    return this.profilesByUserId()[Number(row['id'])];
  }

  isProfileSectionOpen(row: UserRow): boolean {
    return this.profileSectionUserId() === Number(row['id']);
  }

  toggleProfileSection(row: UserRow): void {
    const id = Number(row['id']);
    this.profileSectionUserId.update((cur) => (cur === id ? null : id));
  }

  openProfileEditFromProfile(p: ProfileRow): void {
    this.editProfileRow.set(p);
    this.profileForm.set({
      firstName: (p['firstName'] as string) ?? '',
      lastName: (p['lastName'] as string) ?? '',
      avatarUrl: (p['avatarUrl'] as string) ?? '',
      bio: (p['bio'] as string) ?? ''
    });
  }

  closeProfileEdit(): void {
    this.editProfileRow.set(null);
  }

  saveProfile(): void {
    const row = this.editProfileRow();
    if (!row) return;
    const id = Number(row['id']);
    this.profileBusy.set(true);
    this.api.updateAdminProfile(id, this.profileForm()).subscribe({
      next: (r) => {
        this.profileBusy.set(false);
        if (isApiSuccessStatus(r.status)) {
          this.closeProfileEdit();
          this.flashNotice('ok', r.message || 'Profil enregistré.');
          this.load();
        } else this.flashNotice('err', r.message || 'Échec de l’enregistrement.');
      },
      error: () => {
        this.profileBusy.set(false);
        this.flashNotice('err', 'Enregistrement impossible.');
      }
    });
  }

  patchProfileField<K extends keyof UserProfileRequest>(key: K, value: string): void {
    this.profileForm.update((prev) => ({ ...prev, [key]: value }));
  }

  deleteProfile(p: ProfileRow): void {
    const id = Number(p['id']);
    if (!window.confirm('Supprimer ce profil ?')) return;
    this.profileBusy.set(true);
    this.api.deleteAdminProfile(id).subscribe({
      next: (r) => {
        this.profileBusy.set(false);
        if (isApiSuccessStatus(r.status)) {
          this.closeProfileEdit();
          this.flashNotice('ok', r.message || 'Profil supprimé.');
          this.load();
        } else this.flashNotice('err', r.message || 'Suppression refusée.');
      },
      error: () => {
        this.profileBusy.set(false);
        this.flashNotice('err', 'Suppression impossible.');
      }
    });
  }

  displayRoles(row: UserRow): string {
    return normalizeRoles(row['roles']).join(', ') || '—';
  }

  /** Pour le template : liste des rôles bruts affichés en badges. */
  rolesForDisplay(row: UserRow): string[] {
    return normalizeRoles(row['roles']);
  }

  userInitials(row: UserRow): string {
    const u = row['username'];
    const s = typeof u === 'string' ? u : u != null ? String(u) : '?';
    const t = s.trim() || '?';
    return t.slice(0, 2).toUpperCase();
  }

  isRoleEditorOpen(row: UserRow): boolean {
    return this.roleEditorId() === Number(row['id']);
  }

  openRoleManager(row: UserRow): void {
    const id = Number(row['id']);
    this.roleEditorId.update((cur) => (cur === id ? null : id));
  }

  closeRoleManager(): void {
    this.roleEditorId.set(null);
  }

  draftFor(row: UserRow): string[] {
    return this.roleDraft()[Number(row['id'])] ?? [];
  }

  patchDraft(row: UserRow, value: string[]): void {
    const id = Number(row['id']);
    this.roleDraft.update((d) => ({ ...d, [id]: [...value] }));
  }
  getRoleClass(role: string): string {
    const map: Record<string, string> = {
      'ADMIN': 'bg-rose-100 text-rose-700 border-rose-200',
      'ORGANIZER': 'bg-blue-100 text-blue-700 border-blue-200',
      'CONTROLER': 'bg-amber-100 text-amber-700 border-amber-200',
      'PARTICIPANT': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return map[role.toUpperCase()] || 'border-gray-200 bg-gray-100 text-gray-600';
  }
  private syncRoleDraftFromRows(users: UserRow[]): void {
    const next: Record<number, string[]> = {};
    for (const u of users) {
      const mapped = normalizeRoles(u['roles'])
        .map((r) => this.canonicalRoleName(r))
        .filter((x): x is string => x != null);
      next[Number(u['id'])] = mapped;
    }
    this.roleDraft.set(next);
  }

  /** Aligne la casse sur les libellés connus pour le multiselect (ngValue). */
  private canonicalRoleName(raw: string): string | null {
    const u = raw.trim().toUpperCase();
    const hit = this.roles.find((r) => r.toUpperCase() === u);
    return hit ?? null;
  }

  toggleEnabled(row: UserRow): void {
    const id = Number(row['id']);
    const enabled = !Boolean(row['enabled']);
    this.busyId.set(id);
    this.api.updateAdminUserStatus(id, { enabled }).subscribe({
      next: (r) => {
        this.busyId.set(null);
        if (isApiSuccessStatus(r.status)) {
          this.flashNotice('ok', r.message || 'Statut mis à jour.');
          this.load();
        } else this.flashNotice('err', r.message || 'Action refusée.');
      },
      error: () => {
        this.busyId.set(null);
        this.flashNotice('err', 'Impossible de mettre à jour le statut.');
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
        if (isApiSuccessStatus(r.status)) this.flashNotice('ok', r.message || 'Mot de passe réinitialisé.');
        else this.flashNotice('err', r.message || 'Échec de la réinitialisation.');
      },
      error: () => {
        this.busyId.set(null);
        this.flashNotice('err', 'Réinitialisation impossible (réseau ou serveur).');
      }
    });
  }

  /** Applique la sélection du multiselect : ajoute / retire les rôles par rapport au serveur. */
  applyRoles(row: UserRow): void {
    const id = Number(row['id']);
    const current = new Set(normalizeRoles(row['roles']).map((r) => r.toUpperCase()));
    const desiredRaw = this.roleDraft()[id] ?? [];
    const desired = new Set(desiredRaw.map((r) => r.toUpperCase()));
    const known = new Set(this.roles.map((r) => r.toUpperCase()));
    const toAdd = this.roles.filter((r) => desired.has(r) && !current.has(r));
    const toRemove = [...current].filter((r) => known.has(r) && !desired.has(r));

    if (toAdd.length === 0 && toRemove.length === 0) {
      this.flashNotice('ok', 'Aucun changement de rôles.');
      return;
    }

    this.busyId.set(id);
    const ops = [
      ...toAdd.map((roleName) => ({ kind: 'add' as const, roleName })),
      ...toRemove.map((roleName) => ({ kind: 'remove' as const, roleName }))
    ];

    from(ops)
      .pipe(
        concatMap((op) => {
          const req =
            op.kind === 'add'
              ? this.api.assignAdminUserRole(id, { roleName: op.roleName })
              : this.api.removeAdminUserRole(id, { roleName: op.roleName });
          return req.pipe(
            map((r) => {
              if (!isApiSuccessStatus(r.status)) {
                throw new Error(r.message || 'Action refusée');
              }
              return r;
            })
          );
        })
      )
      .subscribe({
        complete: () => {
          this.busyId.set(null);
          this.roleEditorId.set(null);
          this.flashNotice('ok', 'Rôles mis à jour.');
          this.load();
        },
        error: (e: unknown) => {
          this.busyId.set(null);
          const msg = e instanceof Error ? e.message : 'Requête échouée.';
          this.flashNotice('err', msg);
          this.load();
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

}
