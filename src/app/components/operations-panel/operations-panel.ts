import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { apiErrorMessage } from '../../services/api-error';
import { AuthSession } from '../../services/auth-session';
import { Location, OfferApi, Professional, Specialty } from '../../services/offer-api';
import { AgendaView, Closure, InboxItem, OperationsApi, ProfessionalAppointment } from '../../services/operations-api';
import { StatusHistory } from '../status-history/status-history';

/**
 * HU-029/030 · Agenda aprobada del PROFESSIONAL por día/semana y sede, con cierre de citas terminadas.
 * HU-031 · Bandeja ADMIN con filtros y decisión de solicitudes especializadas y reprogramaciones. HU-032 · Historial por cita.
 */
@Component({
  selector: 'app-operations-panel',
  imports: [DatePipe, FormsModule, StatusHistory],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<main class="bg-[#f8f9ff] p-5 sm:p-10"><section class="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm">
  <div class="flex justify-between">
    <div><p class="text-xs font-bold uppercase tracking-widest text-[#006ef4]">Operación</p>
      <h1 class="mt-2 text-2xl font-extrabold text-[#002777]">{{ session.role() === 'doctor' ? 'Mi agenda de citas' : 'Bandeja administrativa' }}</h1></div>
    <button type="button" (click)="load()" class="rounded-lg border px-3 py-2 text-sm font-bold text-[#002777]">Actualizar</button>
  </div>
  @if (error()) { <p class="mt-4 rounded bg-[#ffdad6] p-3 text-sm text-[#93000a]" role="alert">{{ error() }}</p> }
  @if (message()) { <p class="mt-4 rounded bg-[#e5f5e7] p-3 text-sm text-[#0b5d1e]" role="status">{{ message() }}</p> }

  @if (session.role() === 'doctor') {
    <form class="mt-4 flex flex-wrap items-end gap-2" (ngSubmit)="load()">
      <label class="text-xs font-semibold">Fecha<input [(ngModel)]="agendaFilter.date" name="date" type="date" required class="mt-1 block rounded-lg border border-[#c5c6d3] px-2 py-1"></label>
      <label class="text-xs font-semibold">Vista
        <select [(ngModel)]="agendaFilter.view" name="view" class="mt-1 block rounded-lg border border-[#c5c6d3] px-2 py-1">
          <option value="DAY">Día</option><option value="WEEK">Semana</option></select></label>
      <label class="text-xs font-semibold">Sede
        <select [(ngModel)]="agendaFilter.locationId" name="agendaLocation" class="mt-1 block rounded-lg border border-[#c5c6d3] px-2 py-1">
          <option [ngValue]="null">Todas</option>
          @for (l of locations(); track l.id) { <option [ngValue]="+l.id">{{ l.code }}</option> }</select></label>
      <button type="submit" class="rounded-lg border border-[#c5c6d3] px-3 py-1.5 text-sm font-bold text-[#002777]">Ver agenda</button>
    </form>
    @for (a of agenda(); track a.id) {
      <article class="mt-4 rounded-xl border p-4"><strong class="text-[#002777]">{{ a.specialty }} · {{ a.durationMinutes }} min</strong>
        <p class="text-sm">{{ a.patient }} · {{ a.locationCode }} — {{ a.location }}</p>
        <p class="text-sm text-[#667085]">{{ a.startsAt | date:'EEEE d MMM, HH:mm' }} – {{ a.endsAt | date:'HH:mm' }}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          @if (a.closable) {
            <button type="button" (click)="close(a, 'COMPLETED')" [disabled]="busy() === 'a-' + a.id" class="rounded bg-[#006ef4] px-3 py-2 text-sm font-bold text-white disabled:opacity-60">Completada</button>
            <button type="button" (click)="close(a, 'NO_SHOW')" [disabled]="busy() === 'a-' + a.id" class="rounded border px-3 py-2 text-sm font-bold disabled:opacity-60">No asistió</button>
          } @else { <span class="self-center text-xs text-[#667085]">Podrás cerrarla cuando termine.</span> }
          <app-status-history [appointmentId]="a.id"></app-status-history>
        </div></article>
    } @empty { <p class="mt-4 text-sm text-[#667085]">No hay citas aprobadas en este periodo.</p> }
  }

  @if (session.role() === 'admin') {
    <form class="mt-4 flex flex-wrap items-end gap-2" (ngSubmit)="load()">
      <label class="text-xs font-semibold">Sede
        <select [(ngModel)]="inboxFilter.locationId" name="inboxLocation" class="mt-1 block rounded-lg border border-[#c5c6d3] px-2 py-1">
          <option [ngValue]="null">Todas</option>
          @for (l of locations(); track l.id) { <option [ngValue]="+l.id">{{ l.code }}</option> }</select></label>
      <label class="text-xs font-semibold">Profesional
        <select [(ngModel)]="inboxFilter.professionalId" name="inboxProfessional" class="mt-1 block rounded-lg border border-[#c5c6d3] px-2 py-1">
          <option [ngValue]="null">Todos</option>
          @for (p of professionals(); track p.id) { <option [ngValue]="p.id">{{ p.firstName }} {{ p.lastName }}</option> }</select></label>
      <label class="text-xs font-semibold">Especialidad
        <select [(ngModel)]="inboxFilter.specialtyId" name="inboxSpecialty" class="mt-1 block rounded-lg border border-[#c5c6d3] px-2 py-1">
          <option [ngValue]="null">Todas</option>
          @for (s of specialties(); track s.id) { <option [ngValue]="s.id">{{ s.name }}</option> }</select></label>
      <label class="text-xs font-semibold">Fecha<input [(ngModel)]="inboxFilter.date" name="inboxDate" type="date" class="mt-1 block rounded-lg border border-[#c5c6d3] px-2 py-1"></label>
      <button type="submit" class="rounded-lg border border-[#c5c6d3] px-3 py-1.5 text-sm font-bold text-[#002777]">Filtrar</button>
      <button type="button" (click)="clearInboxFilter()" class="px-2 py-1.5 text-sm font-semibold text-[#006ef4]">Limpiar</button>
    </form>
    @for (i of inbox(); track key(i)) {
      <article class="mt-4 rounded-xl border p-4">
        <strong class="text-[#002777]">{{ i.kind === 'RESCHEDULE' ? 'Reprogramación' : 'Solicitud especializada' }}</strong>
        <p class="text-sm">{{ i.patient }} · {{ i.specialty }}</p>
        <p class="text-sm">{{ i.professional }} · {{ i.locationCode }}</p>
        @if (i.currentStartsAt) { <p class="text-sm text-[#667085]">Franja actual: {{ i.currentStartsAt | date:'EEEE d MMM, HH:mm' }}</p> }
        <p class="text-sm text-[#667085]">{{ i.kind === 'RESCHEDULE' ? 'Nueva franja: ' : '' }}{{ i.startsAt | date:'EEEE d MMM, HH:mm' }} – {{ i.endsAt | date:'HH:mm' }}</p>
        <div class="mt-3 flex flex-wrap items-end gap-2">
          <button type="button" (click)="approve(i)" [disabled]="busy() === key(i)" class="rounded bg-[#006ef4] px-3 py-2 text-sm font-bold text-white disabled:opacity-60">Aprobar</button>
          <label class="grow text-xs font-semibold">Motivo del rechazo
            <input [(ngModel)]="reasons[key(i)]" [name]="'reason-' + key(i)" maxlength="500" class="mt-1 w-full rounded border border-[#c5c6d3] px-2 py-1.5 text-sm"></label>
          <button type="button" (click)="reject(i)" [disabled]="busy() === key(i) || !reasons[key(i)]?.trim()" class="rounded border border-[#ba1a1a] px-3 py-2 text-sm font-bold text-[#93000a] disabled:opacity-40">Rechazar</button>
          <app-status-history [appointmentId]="i.appointmentId"></app-status-history>
        </div>
      </article>
    } @empty { <p class="mt-4 text-sm text-[#667085]">No hay solicitudes pendientes.</p> }
  }
</section></main>`,
})
export class OperationsPanel {
  readonly api = inject(OperationsApi);
  private readonly offer = inject(OfferApi);
  readonly session = inject(AuthSession);
  readonly agenda = signal<ProfessionalAppointment[]>([]);
  readonly inbox = signal<InboxItem[]>([]);
  readonly locations = signal<Location[]>([]);
  readonly professionals = signal<Professional[]>([]);
  readonly specialties = signal<Specialty[]>([]);
  readonly error = signal('');
  readonly message = signal('');
  readonly busy = signal<string | null>(null);
  agendaFilter: { date: string; view: AgendaView; locationId: number | null } = { date: isoDate(new Date()), view: 'WEEK', locationId: null };
  inboxFilter: { locationId: number | null; professionalId: number | null; specialtyId: number | null; date: string } =
    { locationId: null, professionalId: null, specialtyId: null, date: '' };
  reasons: Record<string, string> = {};

  constructor() {
    this.offer.locations().subscribe({ next: v => this.locations.set(v), error: () => this.locations.set([]) });
    if (this.session.role() === 'admin') {
      this.offer.professionals().subscribe({ next: v => this.professionals.set(v), error: () => this.professionals.set([]) });
      this.offer.specialties().subscribe({ next: v => this.specialties.set(v), error: () => this.specialties.set([]) });
    }
    this.load();
  }

  load() {
    this.error.set('');
    if (this.session.role() === 'doctor') {
      if (!this.agendaFilter.date) { this.error.set('Elige una fecha.'); return; }
      const { date, view, locationId } = this.agendaFilter;
      this.api.agenda(date, view, locationId).subscribe({ next: v => this.agenda.set(v), error: e => this.fail(e, 'No fue posible cargar la agenda.') });
    }
    if (this.session.role() === 'admin')
      this.api.inbox(this.inboxFilter).subscribe({ next: v => this.inbox.set(v), error: e => this.fail(e, 'No fue posible cargar la bandeja.') });
  }

  clearInboxFilter() {
    this.inboxFilter = { locationId: null, professionalId: null, specialtyId: null, date: '' };
    this.load();
  }

  key(item: InboxItem) { return item.kind + '-' + item.requestId; }

  approve(item: InboxItem) { this.decide(item, 'APPROVE'); }

  reject(item: InboxItem) {
    const reason = this.reasons[this.key(item)]?.trim();
    if (!reason) { this.error.set('El rechazo exige un motivo.'); return; }
    this.decide(item, 'REJECT', reason);
  }

  /** HU-030 · Solo citas ya terminadas; el backend valida de nuevo propiedad, estado y hora. */
  close(a: ProfessionalAppointment, status: Closure) {
    if (!a.closable) return;
    this.busy.set('a-' + a.id);
    this.message.set('');
    this.api.close(a.id, status).subscribe({
      next: () => { this.message.set(status === 'COMPLETED' ? 'Cita marcada como completada.' : 'Cita marcada como no asistida.'); this.busy.set(null); this.load(); },
      error: e => { this.fail(e, 'No fue posible cerrar la cita.'); this.busy.set(null); this.load(); },
    });
  }

  private decide(item: InboxItem, decision: 'APPROVE' | 'REJECT', reason?: string) {
    this.busy.set(this.key(item));
    this.message.set('');
    this.error.set('');
    const request = item.kind === 'RESCHEDULE' ? this.api.decideReschedule(item.requestId, decision, reason) : this.api.decide(item.appointmentId, decision, reason);
    request.subscribe({
      next: () => {
        this.message.set(decision === 'APPROVE' ? 'Solicitud aprobada.' : 'Solicitud rechazada; la franja solicitada quedó libre.');
        delete this.reasons[this.key(item)];
        this.busy.set(null);
        this.load();
      },
      error: e => { this.fail(e, 'No fue posible registrar la decisión.'); this.busy.set(null); this.load(); },
    });
  }

  private fail(error: unknown, fallback: string) { this.error.set(apiErrorMessage(error, fallback)); }
}

function isoDate(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
