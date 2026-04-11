import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KikeventApiService } from '../../core/services/kikevent-api.service';
import { ApiResponse } from '../../core/models/api-response.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(KikeventApiService);

  readonly loading = signal(true);
  readonly err = signal('');
  readonly userCount = signal(0);
  readonly organizerCount = signal(0);
  readonly pendingOrganizer = signal(0);
  readonly profileCount = signal(0);

  ngOnInit(): void {
    forkJoin({
      users: this.api.listAdminUsers().pipe(
        catchError(() => of(null as ApiResponse<{ users: unknown[] }> | null))
      ),
      org: this.api.listAdminOrganizerRequests().pipe(
        catchError(() => of(null as ApiResponse<unknown> | null))
      ),
      profiles: this.api.listAdminProfiles().pipe(
        catchError(() => of(null as ApiResponse<unknown> | null))
      )
    }).subscribe({
      next: ({ users, org, profiles }) => {
        this.loading.set(false);
        const u = users?.data?.users;
        this.userCount.set(Array.isArray(u) ? u.length : 0);

        const reqs = (org?.data as { requests?: unknown[] } | undefined)?.requests;
        const list = Array.isArray(reqs) ? reqs : [];
        this.organizerCount.set(list.length);
        this.pendingOrganizer.set(
          list.filter((r) => {
            const doc = (r as { document?: { status?: string } })?.document;
            return doc?.status === 'PENDING';
          }).length
        );

        const profs = (profiles?.data as { profiles?: unknown[] } | undefined)?.profiles;
        this.profileCount.set(Array.isArray(profs) ? profs.length : 0);

        const errors = [users, org, profiles].filter((x) => x === null).length;
        if (errors === 3) {
          this.err.set('Impossible de charger les données (réseau ou droits).');
        }
      },
      error: () => {
        this.loading.set(false);
        this.err.set('Erreur de chargement.');
      }
    });
  }
}
