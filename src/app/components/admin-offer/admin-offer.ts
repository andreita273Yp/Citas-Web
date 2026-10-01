import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { apiErrorMessage } from '../../services/api-error';
import { Location, NewProfessional, OfferApi, Professional, Specialty } from '../../services/offer-api';
import { AdminInsurance } from '../admin-insurance/admin-insurance';

type Tab = 'specialties' | 'professionals' | 'insurance';

/** HU-012 a HU-017 · CRUD de especialidades, profesionales y EPS/planes para ADMIN. El backend valida todas las reglas. */
@Component({
  selector: 'app-admin-offer',
  imports: [FormsModule, AdminInsurance],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-offer.html',
})
export class AdminOffer {
  private readonly api = inject(OfferApi);

  readonly tab = signal<Tab>('specialties');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly message = signal('');

  readonly specialties = signal<Specialty[]>([]);
  readonly professionals = signal<Professional[]>([]);
  readonly locations = signal<Location[]>([]);
  readonly activeSpecialties = computed(() => this.specialties().filter(s => s.active));

  newSpecialty = { code: '', name: '', durationMinutes: 30 };
  newProfessional: NewProfessional = emptyProfessional();

  /** Edición de asignaciones del profesional seleccionado. */
  readonly editing = signal<Professional | null>(null);
  selectedSpecialtyIds: Record<number, boolean> = {};
  primarySpecialtyId: number | null = null;
  selectedLocationIds: Record<string, boolean> = {};

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.specialties().subscribe({ next: v => this.specialties.set(v), error: e => this.fail(e, 'No fue posible cargar las especialidades.') });
    this.api.locations().subscribe({ next: v => this.locations.set(v), error: e => this.fail(e, 'No fue posible cargar las sedes.') });
    this.api.professionals().subscribe({
      next: v => { this.professionals.set(v); this.loading.set(false); },
      error: e => { this.fail(e, 'No fue posible cargar los profesionales.'); this.loading.set(false); },
    });
  }

  // ------------------------------------------------------------ especialidades (HU-014)

  createSpecialty() {
    const s = this.newSpecialty;
    this.run(this.api.createSpecialty(s.code, s.name, Number(s.durationMinutes)), 'Especialidad creada.', created => {
      this.specialties.update(list => [...list, created].sort((a, b) => a.name.localeCompare(b.name)));
      this.newSpecialty = { code: '', name: '', durationMinutes: 30 };
    });
  }

  changeDuration(specialty: Specialty, minutes: number) {
    this.run(this.api.updateSpecialty(specialty.id, { durationMinutes: Number(minutes) as 30 | 60 }), 'Duración actualizada.', updated => this.replaceSpecialty(updated));
  }

  toggleSpecialty(specialty: Specialty) {
    const label = specialty.active ? 'Especialidad desactivada: ya no admite nuevas reservas.' : 'Especialidad activada.';
    this.run(this.api.updateSpecialty(specialty.id, { active: !specialty.active }), label, updated => this.replaceSpecialty(updated));
  }

  // ------------------------------------------------------------ profesionales (HU-015/016/017)

  createProfessional() {
    this.run(this.api.createProfessional(this.newProfessional), 'Profesional creado. Asígnale especialidades y sedes.', created => {
      this.professionals.update(list => [...list, created]);
      this.newProfessional = emptyProfessional();
      this.edit(created);
    });
  }

  toggleProfessional(professional: Professional) {
    const label = professional.active ? 'Profesional desactivado.' : 'Profesional activado.';
    this.run(this.api.setProfessionalActive(professional.id, !professional.active), label, updated => this.replaceProfessional(updated));
  }

  edit(professional: Professional) {
    this.editing.set(professional);
    this.selectedSpecialtyIds = Object.fromEntries(professional.specialties.map(s => [s.id, true]));
    this.primarySpecialtyId = professional.specialties.find(s => s.primary)?.id ?? null;
    this.selectedLocationIds = Object.fromEntries(professional.locations.map(l => [String(l.id), true]));
    this.message.set('');
    this.error.set('');
  }

  saveSpecialties(professional: Professional) {
    const assignments = Object.entries(this.selectedSpecialtyIds).filter(([, on]) => on)
      .map(([id]) => ({ specialtyId: Number(id), primary: Number(id) === this.primarySpecialtyId }));
    this.run(this.api.assignSpecialties(professional.id, assignments), 'Especialidades actualizadas.', updated => this.replaceProfessional(updated));
  }

  saveLocations(professional: Professional) {
    const ids = Object.entries(this.selectedLocationIds).filter(([, on]) => on).map(([id]) => Number(id));
    this.run(this.api.assignLocations(professional.id, ids), 'Sedes actualizadas.', updated => this.replaceProfessional(updated));
  }

  specialtyNames(professional: Professional) {
    return professional.specialties.map(s => (s.primary ? `${s.name} (primaria)` : s.name)).join(', ') || 'Sin especialidades';
  }

  locationCodes(professional: Professional) {
    return professional.locations.map(l => l.code).join(' · ') || 'Sin sedes';
  }

  // ------------------------------------------------------------ utilidades

  private run<T>(request: Observable<T>, success: string, onSuccess: (value: T) => void) {
    this.saving.set(true);
    this.error.set('');
    this.message.set('');
    request.subscribe({
      next: value => { onSuccess(value); this.message.set(success); this.saving.set(false); },
      error: e => { this.fail(e, 'No fue posible guardar los cambios.'); this.saving.set(false); },
    });
  }

  private replaceSpecialty(updated: Specialty) {
    this.specialties.update(list => list.map(s => (s.id === updated.id ? updated : s)));
  }

  private replaceProfessional(updated: Professional) {
    this.professionals.update(list => list.map(p => (p.id === updated.id ? updated : p)));
    if (this.editing()?.id === updated.id) this.edit(updated);
  }

  private fail(error: unknown, fallback: string) {
    this.error.set(apiErrorMessage(error, fallback));
  }
}

function emptyProfessional(): NewProfessional {
  return { firstName: '', lastName: '', documentType: 'CC', documentNumber: '', email: '', phone: '', initialPassword: '', professionalCode: '', licenseNumber: '' };
}
