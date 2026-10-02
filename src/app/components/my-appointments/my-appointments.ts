import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiErrorMessage } from '../../services/api-error';
import { Appointment, AppointmentApi, AppointmentFilter, AppointmentStatus } from '../../services/appointment-api';
import { AvailableStart, BookingApi, LocationOption } from '../../services/booking-api';
import { StatusHistory } from '../status-history/status-history';

const LABELS: Record<AppointmentStatus, string> = {
  REQUESTED: 'Pendiente de aprobación', APPROVED: 'Aprobada', REJECTED: 'Rechazada', CANCELLED: 'Cancelada', COMPLETED: 'Atendida', NO_SHOW: 'No asistió',
};

/** HU-025 a HU-028 · Mis citas: filtros, detalle, cancelación y reprogramación (mismo profesional y especialidad). HU-032 · historial. */
@Component({
  selector: 'app-my-appointments',
  imports: [FormsModule, DatePipe, StatusHistory],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-appointments.html',
})
export class MyAppointments {
  private readonly api = inject(AppointmentApi);
  private readonly booking = inject(BookingApi);

  readonly appointments = signal<Appointment[]>([]);
  readonly locations = signal<LocationOption[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly message = signal('');

  readonly rescheduling = signal<Appointment | null>(null);
  readonly options = signal<AvailableStart[]>([]);
  readonly searched = signal(false);

  readonly statuses = Object.keys(LABELS) as AppointmentStatus[];
  readonly today = new Date().toISOString().slice(0, 10);
  filter: AppointmentFilter = { status: '', from: '', to: '' };
  rescheduleDate = '';
  rescheduleLocation: number | null = null;

  constructor() {
    this.booking.locations().subscribe({ next: v => this.locations.set(v) });
    this.load();
  }

  label(status: AppointmentStatus) { return LABELS[status]; }

  /** RF-14: solo citas futuras no terminales. El backend lo vuelve a validar. */
  cancellable(a: Appointment) { return (a.status === 'APPROVED' || a.status === 'REQUESTED') && new Date(a.startsAt) > new Date(); }

  /** RF-15: solo aprobadas, futuras y sin una reprogramación pendiente. */
  reschedulable(a: Appointment) { return a.status === 'APPROVED' && new Date(a.startsAt) > new Date() && a.reschedule?.status !== 'PENDING'; }

  awaitingChoice(a: Appointment) { return a.status === 'APPROVED' && a.reschedule?.status === 'REJECTED' && !a.reschedule.patientAction; }

  load() {
    this.loading.set(true);
    this.api.mine(this.filter).subscribe({
      next: v => { this.appointments.set(v); this.loading.set(false); },
      error: e => { this.fail(e, 'No fue posible cargar tus citas.'); this.loading.set(false); },
    });
  }

  cancel(a: Appointment) {
    if (!confirm(`¿Cancelar la cita de ${a.specialty} del ${new Date(a.startsAt).toLocaleString()}?`)) return;
    this.run(this.api.cancel(a.id), 'Cita cancelada; el horario quedó libre.');
  }

  keep(a: Appointment) {
    if (!a.reschedule) return;
    this.run(this.api.keepAfterRejection(a.id, a.reschedule.id), 'Conservas tu cita original.');
  }

  openReschedule(a: Appointment) {
    this.rescheduling.set(a);
    this.rescheduleDate = '';
    this.rescheduleLocation = a.locationId;
    this.options.set([]);
    this.searched.set(false);
  }

  searchSlots() {
    const a = this.rescheduling();
    if (!a || !this.rescheduleDate) return;
    this.booking.availability({ specialtyId: a.specialtyId, professionalId: a.professionalId, locationId: this.rescheduleLocation, date: this.rescheduleDate })
      .subscribe({ next: v => { this.options.set(v); this.searched.set(true); }, error: e => this.fail(e, 'No fue posible consultar horarios.') });
  }

  requestReschedule(start: AvailableStart) {
    const a = this.rescheduling();
    if (!a) return;
    this.run(this.api.reschedule(a.id, start.startAt.slice(0, 16), start.locationId),
      'Solicitud enviada. Tu cita actual se mantiene hasta que el administrador decida.', () => this.rescheduling.set(null));
  }

  private run<T>(request: Observable<T>, success: string, after?: () => void) {
    this.busy.set(true);
    this.error.set('');
    this.message.set('');
    request.subscribe({
      next: () => { this.message.set(success); this.busy.set(false); after?.(); this.load(); },
      error: (e: unknown) => {
        this.busy.set(false);
        this.fail(e, 'No fue posible completar la acción.');
        if (e instanceof HttpErrorResponse && e.status === 409) { this.load(); if (this.rescheduling()) this.searchSlots(); }
      },
    });
  }

  private fail(e: unknown, fallback: string) { this.error.set(apiErrorMessage(e, fallback)); }
}
