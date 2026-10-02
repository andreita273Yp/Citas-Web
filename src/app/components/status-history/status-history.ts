import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { apiErrorMessage } from '../../services/api-error';
import { AppointmentStatusCode, HistoryEntry, OperationsApi } from '../../services/operations-api';

const STATUS: Record<AppointmentStatusCode, string> = {
  REQUESTED: 'Solicitada', APPROVED: 'Aprobada', REJECTED: 'Rechazada', CANCELLED: 'Cancelada', COMPLETED: 'Completada', NO_SHOW: 'No asistió',
};
const SOURCE: Record<HistoryEntry['source'], string> = { SYSTEM: 'Sistema', USER: 'Usuario', ADMIN: 'Administración' };

/** HU-032 · Historial de estados de una cita, de solo lectura; se carga al abrirlo. */
@Component({
  selector: 'app-status-history',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<button type="button" (click)="toggle()" [attr.aria-expanded]="open()" class="rounded-lg border border-[#c5c6d3] px-3 py-2 text-sm font-bold text-[#002777]">
  {{ open() ? 'Ocultar historial' : 'Ver historial' }}</button>
@if (open()) {
  @if (error()) { <p class="mt-2 rounded bg-[#ffdad6] p-2 text-sm text-[#93000a]" role="alert">{{ error() }}</p> }
  <ol class="mt-2 basis-full space-y-1 border-l-2 border-[#d3e4fe] pl-3 text-sm">
    @for (e of entries(); track e.id) {
      <li><span class="text-[#667085]">{{ e.occurredAt | date:'d MMM y, HH:mm' }}</span> ·
        {{ e.previousStatus ? label(e.previousStatus) + ' → ' : '' }}<strong>{{ label(e.newStatus) }}</strong>
        <span class="text-[#667085]"> · {{ source(e.source) }}</span>
        @if (e.reason) { <span> — {{ e.reason }}</span> }</li>
    } @empty { @if (!error()) { <li class="text-[#667085]">Cargando…</li> } }
  </ol>
}`,
})
export class StatusHistory {
  private readonly api = inject(OperationsApi);
  readonly appointmentId = input.required<number>();
  readonly open = signal(false);
  readonly entries = signal<HistoryEntry[]>([]);
  readonly error = signal('');

  toggle() {
    this.open.update(v => !v);
    if (!this.open()) return;
    this.error.set('');
    this.api.history(this.appointmentId()).subscribe({
      next: v => this.entries.set(v),
      error: e => this.error.set(apiErrorMessage(e, 'No fue posible cargar el historial.')),
    });
  }

  label(status: AppointmentStatusCode) { return STATUS[status]; }

  source(source: HistoryEntry['source']) { return SOURCE[source]; }
}
