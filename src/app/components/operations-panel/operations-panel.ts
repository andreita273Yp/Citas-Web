import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { apiErrorMessage } from '../../services/api-error';
import { AuthSession } from '../../services/auth-session';
import { InboxItem, OperationsApi, ProfessionalAppointment } from '../../services/operations-api';

/** Agenda aprobada del PROFESSIONAL y bandeja ADMIN con decisión de solicitudes especializadas (HU-024). */
@Component({
  selector: 'app-operations-panel',
  imports: [DatePipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<main class="bg-[#f8f9ff] p-5 sm:p-10"><section class="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
  <div class="flex justify-between">
    <div><p class="text-xs font-bold uppercase tracking-widest text-[#006ef4]">Operación</p>
      <h1 class="mt-2 text-2xl font-extrabold text-[#002777]">{{ session.role() === 'doctor' ? 'Citas aprobadas' : 'Bandeja administrativa' }}</h1></div>
    <button type="button" (click)="load()" class="rounded-lg border px-3 py-2 text-sm font-bold text-[#002777]">Actualizar</button>
  </div>
  @if (error()) { <p class="mt-4 rounded bg-[#ffdad6] p-3 text-sm text-[#93000a]" role="alert">{{ error() }}</p> }
  @if (message()) { <p class="mt-4 rounded bg-[#e5f5e7] p-3 text-sm text-[#0b5d1e]" role="status">{{ message() }}</p> }

  @if (session.role() === 'doctor') {
    @for (a of agenda(); track a.id) {
      <article class="mt-4 rounded-xl border p-4"><strong class="text-[#002777]">{{ a.specialty }}</strong>
        <p class="text-sm">{{ a.patient }} · {{ a.location }}</p><p class="text-sm text-[#667085]">{{ a.startsAt | date:'medium' }}</p>
        <div class="mt-3 flex gap-2">
          <button type="button" (click)="close(a, 'COMPLETED')" class="rounded bg-[#006ef4] px-3 py-2 text-sm font-bold text-white">Completada</button>
          <button type="button" (click)="close(a, 'NO_SHOW')" class="rounded border px-3 py-2 text-sm font-bold">No asistió</button>
        </div></article>
    } @empty { <p class="mt-4 text-sm text-[#667085]">No hay citas aprobadas en tu agenda.</p> }
  }

  @if (session.role() === 'admin') {
    @for (i of inbox(); track i.kind + i.requestId) {
      <article class="mt-4 rounded-xl border p-4">
        <strong class="text-[#002777]">{{ i.kind === 'RESCHEDULE' ? 'Reprogramación' : 'Solicitud especializada' }}</strong>
        <p class="text-sm">{{ i.patient }} · {{ i.specialty }}</p>
        <p class="text-sm">{{ i.professional }}</p>
        <p class="text-sm text-[#667085]">{{ i.startsAt | date:'EEEE d MMM, HH:mm' }} – {{ i.endsAt | date:'HH:mm' }}</p>
        @if (i.kind === 'SPECIALIZED_REQUEST') {
          <div class="mt-3 flex flex-wrap items-end gap-2">
            <button type="button" (click)="approve(i)" [disabled]="busy() === i.appointmentId" class="rounded bg-[#006ef4] px-3 py-2 text-sm font-bold text-white disabled:opacity-60">Aprobar</button>
            <label class="grow text-xs font-semibold">Motivo del rechazo
              <input [(ngModel)]="reasons[i.appointmentId]" [name]="'reason-' + i.appointmentId" maxlength="500" class="mt-1 w-full rounded border border-[#c5c6d3] px-2 py-1.5 text-sm"></label>
            <button type="button" (click)="reject(i)" [disabled]="busy() === i.appointmentId || !reasons[i.appointmentId]?.trim()" class="rounded border border-[#ba1a1a] px-3 py-2 text-sm font-bold text-[#93000a] disabled:opacity-40">Rechazar</button>
          </div>
        }
      </article>
    } @empty { <p class="mt-4 text-sm text-[#667085]">No hay solicitudes pendientes.</p> }
  }
</section></main>`,
})
export class OperationsPanel {
  readonly api = inject(OperationsApi);
  readonly session = inject(AuthSession);
  readonly agenda = signal<ProfessionalAppointment[]>([]);
  readonly inbox = signal<InboxItem[]>([]);
  readonly error = signal('');
  readonly message = signal('');
  readonly busy = signal<string | null>(null);
  reasons: Record<string, string> = {};

  constructor() { this.load(); }

  load() {
    this.error.set('');
    if (this.session.role() === 'doctor') this.api.agenda().subscribe({ next: v => this.agenda.set(v), error: e => this.fail(e, 'No fue posible cargar la agenda.') });
    if (this.session.role() === 'admin') this.api.inbox().subscribe({ next: v => this.inbox.set(v), error: e => this.fail(e, 'No fue posible cargar la bandeja.') });
  }

  approve(item: InboxItem) { this.decide(item, 'APPROVE'); }

  reject(item: InboxItem) {
    const reason = this.reasons[item.appointmentId]?.trim();
    if (!reason) { this.error.set('El rechazo exige un motivo.'); return; }
    this.decide(item, 'REJECT', reason);
  }

  close(a: ProfessionalAppointment, status: 'COMPLETED' | 'NO_SHOW') {
    this.api.close(a.id, status).subscribe({ next: () => { this.message.set('Cita cerrada.'); this.load(); }, error: e => this.fail(e, 'No fue posible cerrar la cita.') });
  }

  private decide(item: InboxItem, decision: 'APPROVE' | 'REJECT', reason?: string) {
    this.busy.set(item.appointmentId);
    this.message.set('');
    this.error.set('');
    this.api.decide(item.appointmentId, decision, reason).subscribe({
      next: () => {
        this.message.set(decision === 'APPROVE' ? 'Solicitud aprobada.' : 'Solicitud rechazada; el horario quedó libre.');
        delete this.reasons[item.appointmentId];
        this.busy.set(null);
        this.load();
      },
      error: e => { this.fail(e, 'No fue posible registrar la decisión.'); this.busy.set(null); this.load(); },
    });
  }

  private fail(error: unknown, fallback: string) { this.error.set(apiErrorMessage(error, fallback)); }
}
