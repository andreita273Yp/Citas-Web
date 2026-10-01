import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { apiErrorMessage } from '../../services/api-error';
import { AuthSession } from '../../services/auth-session';
import { ClinicalData } from '../../services/clinical-data';
import { Affiliation, Eps, EpsPlan, IdentityApi, Profile } from '../../services/identity-api';

/** HU-010 perfil (solo teléfono editable) · HU-011 afiliación opcional (EPS → plan; el régimen sale del plan). */
@Component({
  selector: 'app-identity-dashboard',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './identity-dashboard.html',
})
export class IdentityDashboard {
  private readonly api = inject(IdentityApi);
  readonly session = inject(AuthSession);
  readonly clinical = inject(ClinicalData);

  readonly profile = signal<Profile | null>(null);
  readonly affiliation = signal<Affiliation | null>(null);
  readonly epsList = signal<Eps[]>([]);
  readonly plans = signal<EpsPlan[]>([]);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly message = signal('');

  /** La afiliación aplica a pacientes; el personal no la necesita para operar. */
  readonly isPatient = computed(() => this.session.role() === 'patient');

  phone = '';
  selectedEps: number | null = null;
  selectedPlan: number | null = null;
  membershipNumber = '';

  readonly selectedPlanInfo = computed(() => this.plans().find(p => p.id === this.selectedPlanSignal()) ?? null);
  private readonly selectedPlanSignal = signal<number | null>(null);

  constructor() {
    this.api.me().subscribe({ next: p => { this.profile.set(p); this.phone = p.phone; }, error: e => this.fail(e, 'No fue posible cargar tu perfil.') });
    if (this.isPatient()) {
      this.api.eps().subscribe({ next: v => this.epsList.set(v), error: e => this.fail(e, 'No fue posible cargar las EPS.') });
      this.api.affiliation().subscribe({ next: a => this.showAffiliation(a), error: e => this.fail(e, 'No fue posible cargar tu afiliación.') });
    }
  }

  savePhone() {
    this.start();
    this.api.updatePhone(this.phone).subscribe({
      next: p => { this.profile.set(p); this.phone = p.phone; this.done('Teléfono actualizado.'); },
      error: e => this.failSave(e, 'No fue posible actualizar el teléfono.'),
    });
  }

  loadPlans(keepPlan: number | null = null) {
    this.selectedPlan = keepPlan;
    this.selectedPlanSignal.set(keepPlan);
    this.plans.set([]);
    if (this.selectedEps) {
      this.api.plans(this.selectedEps).subscribe({ next: v => this.plans.set(v), error: e => this.fail(e, 'No fue posible cargar los planes.') });
    }
  }

  choosePlan() {
    this.selectedPlanSignal.set(this.selectedPlan);
  }

  saveAffiliation() {
    if (!this.selectedPlan) return;
    this.start();
    this.api.saveAffiliation(this.selectedPlan, this.membershipNumber).subscribe({
      next: a => { this.affiliation.set(a); this.done('Afiliación guardada.'); },
      error: e => this.failSave(e, 'No fue posible guardar la afiliación.'),
    });
  }

  endAffiliation() {
    this.start();
    this.api.endAffiliation().subscribe({
      next: () => { this.showAffiliation(null); this.done('Afiliación retirada.'); },
      error: e => this.failSave(e, 'No fue posible retirar la afiliación.'),
    });
  }

  private showAffiliation(a: Affiliation | null) {
    this.affiliation.set(a);
    this.selectedEps = a?.epsId ?? null;
    this.membershipNumber = a?.membershipNumber ?? '';
    this.loadPlans(a?.planId ?? null);
  }

  private start() { this.saving.set(true); this.error.set(''); this.message.set(''); }
  private done(text: string) { this.message.set(text); this.saving.set(false); }
  private failSave(e: unknown, fallback: string) { this.fail(e, fallback); this.saving.set(false); }
  private fail(e: unknown, fallback: string) { this.error.set(apiErrorMessage(e, fallback)); }
}
