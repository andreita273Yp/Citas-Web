import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage } from '../../services/api-error';
import {
  AppointmentType, AvailableStart, Booked, BookingApi, LocationOption, ProfessionalOption, SpecialtyOption,
} from '../../services/booking-api';

/**
 * HU-021 a HU-023 · Búsqueda y reserva: sede → tipo → especialidad → profesional (opcional) → fecha → horario.
 * La UI no asume el resultado: el estado (APPROVED o REQUESTED) lo decide el backend.
 */
@Component({
  selector: 'app-book-appointment',
  imports: [FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './book-appointment.html',
})
export class BookAppointment {
  private readonly api = inject(BookingApi);

  readonly locations = signal<LocationOption[]>([]);
  readonly specialties = signal<SpecialtyOption[]>([]);
  readonly professionals = signal<ProfessionalOption[]>([]);
  readonly starts = signal<AvailableStart[]>([]);
  readonly selected = signal<AvailableStart | null>(null);
  readonly booked = signal<Booked | null>(null);

  readonly searching = signal(false);
  readonly searched = signal(false);
  readonly booking = signal(false);
  readonly error = signal('');

  locationId: number | null = null;
  type: AppointmentType = 'GENERAL';
  specialtyId: number | null = null;
  professionalId: number | null = null;
  readonly today = isoDate(new Date());
  date = this.today;
  reason = '';

  readonly specialty = computed(() => this.specialties().find(s => s.id === this.specialtyIdSignal()) ?? null);
  private readonly specialtyIdSignal = signal<number | null>(null);

  constructor() {
    this.api.locations().subscribe({ next: v => this.locations.set(v), error: e => this.fail(e, 'No fue posible cargar las sedes.') });
    this.loadSpecialties();
  }

  changeType(type: AppointmentType) {
    this.type = type;
    this.specialtyId = null;
    this.specialtyIdSignal.set(null);
    this.professionals.set([]);
    this.resetResults();
    this.loadSpecialties();
  }

  changeSpecialtyOrLocation() {
    this.specialtyIdSignal.set(this.specialtyId);
    this.professionalId = null;
    this.professionals.set([]);
    this.resetResults();
    if (this.specialtyId && this.locationId) {
      this.api.professionals(this.specialtyId, this.locationId).subscribe({
        next: v => this.professionals.set(v), error: e => this.fail(e, 'No fue posible cargar los profesionales.'),
      });
    }
  }

  /** {@code refresh}: recarga tras reservar o tras un 409 conservando el aviso mostrado al usuario. */
  search(refresh = false) {
    if (!this.specialtyId || !this.date) { this.error.set('Selecciona la especialidad y la fecha.'); return; }
    this.searching.set(true);
    if (refresh) this.selected.set(null);
    else this.resetResults();
    this.api.availability({ specialtyId: this.specialtyId, date: this.date, locationId: this.locationId, professionalId: this.professionalId })
      .subscribe({
        next: v => { this.starts.set(v); this.searched.set(true); this.searching.set(false); },
        error: e => { this.fail(e, 'No fue posible consultar la disponibilidad.'); this.searching.set(false); },
      });
  }

  choose(start: AvailableStart) {
    this.selected.set(start);
    this.booked.set(null);
    this.error.set('');
  }

  confirm() {
    const start = this.selected();
    if (!start || !this.specialtyId) return;
    this.booking.set(true);
    this.error.set('');
    this.api.book({ professionalId: start.professionalId, locationId: start.locationId, specialtyId: this.specialtyId,
      startAt: start.startAt.slice(0, 16), reason: this.reason || undefined }).subscribe({
      next: result => { this.booked.set(result); this.selected.set(null); this.reason = ''; this.booking.set(false); this.search(true); },
      error: (e: unknown) => {
        this.booking.set(false);
        if (e instanceof HttpErrorResponse && e.status === 409) {
          this.error.set('Ese horario acaba de ser tomado. Elige otro de la lista actualizada.');
          this.search(true);
        } else {
          this.fail(e, 'No fue posible confirmar la cita.');
        }
      },
    });
  }

  private loadSpecialties() {
    this.api.specialties(this.type).subscribe({ next: v => this.specialties.set(v), error: e => this.fail(e, 'No fue posible cargar las especialidades.') });
  }

  private resetResults() {
    this.starts.set([]);
    this.selected.set(null);
    this.searched.set(false);
    this.error.set('');
  }

  private fail(error: unknown, fallback: string) {
    this.error.set(apiErrorMessage(error, fallback));
  }
}

function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
