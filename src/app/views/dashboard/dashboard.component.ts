import { Component, inject, OnInit, signal, computed, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KikeventApiService } from '../../core/services/kikevent-api.service';
import { ApiResponse } from '../../core/models/api-response.model';

interface OrgRequest {
  document?: { status?: string };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('donutCanvas') donutCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas') barCanvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly api = inject(KikeventApiService);

  readonly loading = signal(true);
  readonly err = signal('');
  readonly userCount = signal(0);
  readonly organizerCount = signal(0);
  readonly pendingOrganizer = signal(0);
  readonly approvedOrganizer = signal(0);
  readonly rejectedOrganizer = signal(0);
  readonly profileCount = signal(0);

  /** Ratio profils vérifiés / utilisateurs (0–100) */
  readonly profileRatio = computed(() => {
    const u = this.userCount();
    const p = this.profileCount();
    return u > 0 ? Math.round((p / u) * 100) : 0;
  });

  /** Pourcentage de demandes en attente */
  readonly pendingRatio = computed(() => {
    const total = this.organizerCount();
    return total > 0 ? Math.round((this.pendingOrganizer() / total) * 100) : 0;
  });

  private chartsDrawn = false;

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

        const reqs = (org?.data as { requests?: OrgRequest[] } | undefined)?.requests;
        const list: OrgRequest[] = Array.isArray(reqs) ? reqs : [];
        this.organizerCount.set(list.length);
        this.pendingOrganizer.set(list.filter(r => r?.document?.status === 'PENDING').length);
        this.approvedOrganizer.set(list.filter(r => r?.document?.status === 'APPROVED').length);
        this.rejectedOrganizer.set(list.filter(r => r?.document?.status === 'REJECTED').length);

        const profs = (profiles?.data as { profiles?: unknown[] } | undefined)?.profiles;
        this.profileCount.set(Array.isArray(profs) ? profs.length : 0);

        const errors = [users, org, profiles].filter(x => x === null).length;
        if (errors === 3) {
          this.err.set('Impossible de charger les données (réseau ou droits).');
        }

        setTimeout(() => this.drawCharts(), 50);
      },
      error: () => {
        this.loading.set(false);
        this.err.set('Erreur de chargement.');
      }
    });
  }

  ngAfterViewInit(): void {}

  private drawCharts(): void {
    if (this.chartsDrawn) return;
    this.chartsDrawn = true;
    this.drawDonut();
    this.drawBar();
  }

  /** Donut — répartition des demandes organisateur */
  private drawDonut(): void {
    const canvas = this.donutCanvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pending = this.pendingOrganizer();
    const approved = this.approvedOrganizer();
    const rejected = this.rejectedOrganizer();
    const total = pending + approved + rejected;

    const data = total > 0 ? [approved, pending, rejected] : [1];
    const colors = total > 0 ? ['#10b981', '#f59e0b', '#ef4444'] : ['#e5e7eb'];
    const labels = ['Approuvées', 'En attente', 'Rejetées'];

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 20;
    const innerRadius = radius * 0.6;

    let startAngle = -Math.PI / 2;
    const dataTotal = data.reduce((a, b) => a + b, 0);

    data.forEach((value, i) => {
      const slice = (value / dataTotal) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      startAngle += slice;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.font = `bold ${Math.round(radius * 0.38)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(total), cx, cy - 8);
    ctx.font = `${Math.round(radius * 0.18)}px Inter, sans-serif`;
    ctx.fillStyle = '#6b7280';
    ctx.fillText('demandes', cx, cy + radius * 0.22);

    if (total > 0) {
      const legendY = canvas.height - 22;
      const spacing = canvas.width / 3;
      labels.forEach((label, i) => {
        const x = spacing * i + spacing / 2;
        ctx.fillStyle = colors[i];
        ctx.fillRect(x - 30, legendY - 6, 10, 10);
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${label} (${data[i]})`, x - 16, legendY + 2);
      });
    }
  }

  /** Bar chart — utilisateurs vs profils vs organisateurs */
  private drawBar(): void {
    const canvas = this.barCanvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const paddingLeft = 36;
    const paddingBottom = 36;
    const paddingTop = 16;
    const paddingRight = 16;

    const rawData = [
      { label: 'Utilisateurs', value: this.userCount(), color: '#7c3aed' },
      { label: 'Profils vérifiés', value: this.profileCount(), color: '#ec4899' },
      { label: 'Organisateurs', value: this.organizerCount(), color: '#3b82f6' }
    ];

    const maxVal = Math.max(...rawData.map(d => d.value), 1);
    const chartH = H - paddingTop - paddingBottom;
    const chartW = W - paddingLeft - paddingRight;

    const gridLines = 4;
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridLines; i++) {
      const y = paddingTop + chartH - (i / gridLines) * chartH;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(W - paddingRight, y);
      ctx.stroke();

      const val = Math.round((i / gridLines) * maxVal);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(val), paddingLeft - 4, y + 3);
    }

    const barGroupWidth = chartW / rawData.length;
    const barWidth = barGroupWidth * 0.5;

    rawData.forEach((item, i) => {
      const barH = item.value === 0 ? 2 : (item.value / maxVal) * chartH;
      const x = paddingLeft + i * barGroupWidth + (barGroupWidth - barWidth) / 2;
      const y = paddingTop + chartH - barH;

      const r = Math.min(6, barWidth / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barWidth - r, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
      ctx.lineTo(x + barWidth, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(item.value), x + barWidth / 2, y - 6);

      ctx.fillStyle = '#6b7280';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(item.label, x + barWidth / 2, H - 8);
    });
  }
}
