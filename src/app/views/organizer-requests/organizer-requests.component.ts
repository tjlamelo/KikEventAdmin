import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KikeventApiService } from '../../core/services/kikevent-api.service';

type OrgRow = Record<string, unknown>;

@Component({
  selector: 'app-organizer-requests',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './organizer-requests.component.html',
  styleUrl: './organizer-requests.component.scss'
})
export class OrganizerRequestsComponent implements OnInit {
  private readonly api = inject(KikeventApiService);

  readonly rows = signal<OrgRow[]>([]);
  readonly loading = signal(true);
  readonly err = signal('');
  readonly selected = signal<OrgRow | null>(null);
  readonly rejectionReason = signal('');
  readonly busy = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.err.set('');
    this.api.listAdminOrganizerRequests().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.status !== 200) {
          this.err.set(res.message || 'Erreur');
          return;
        }
        const reqs = (res.data as { requests?: OrgRow[] } | undefined)?.requests ?? [];
        this.rows.set(reqs);
      },
      error: (e: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.err.set(e?.error?.message ?? 'Chargement impossible');
      }
    });
  }

  docStatus(row: OrgRow): string {
    const doc = row['document'] as { status?: string } | undefined;
    return doc?.status ?? '—';
  }

  docFileUrl(row: OrgRow): string | null {
    const doc = row['document'] as { fileUrl?: string } | undefined;
    const u = doc?.fileUrl;
    return typeof u === 'string' && u.length ? u : null;
  }

  displayName(row: OrgRow): string {
    const p = row['organizerProfile'] as { displayName?: string } | undefined;
    return p?.displayName ?? '—';
  }

  select(row: OrgRow): void {
    this.selected.set(row);
    this.rejectionReason.set('');
  }

  decide(approved: boolean): void {
    const row = this.selected();
    if (!row) return;
    const userId = Number(row['userId']);
    this.busy.set(true);
    this.api
      .decideAdminOrganizerRequest(userId, {
        approved,
        rejectionReason: approved ? null : this.rejectionReason() || null
      })
      .subscribe({
        next: (r) => {
          this.busy.set(false);
          if (r.status === 200) {
            this.selected.set(null);
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
