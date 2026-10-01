import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiErrorMessage } from '../../services/api-error';
import { Eps, EpsPlan, IdentityApi, RecoveryMessage, Regime } from '../../services/identity-api';

/** HU-012/013 · CRUD lógico de EPS y planes (sin borrado) y buzón local de recuperación (solo desarrollo). */
@Component({
  selector: 'app-admin-insurance',
  imports: [FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-insurance.html',
})
export class AdminInsurance {
  private readonly api = inject(IdentityApi);

  readonly eps = signal<Eps[]>([]);
  readonly plans = signal<EpsPlan[]>([]);
  readonly regimes = signal<Regime[]>([]);
  readonly mailbox = signal<RecoveryMessage[] | null>(null);
  readonly selectedEpsId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly message = signal('');

  newEps = { code: '', name: '' };
  newPlan = { code: '', name: '', regimeId: null as number | null };
  renames: Record<string, string> = {};

  constructor() {
    this.loadEps();
    this.api.regimes().subscribe({ next: v => this.regimes.set(v), error: e => this.fail(e, 'No fue posible cargar los regímenes.') });
    this.loadMailbox();
  }

  loadEps() {
    this.api.adminEps().subscribe({ next: v => this.eps.set(v), error: e => this.fail(e, 'No fue posible cargar las EPS.') });
  }

  selectEps(eps: Eps) {
    this.selectedEpsId.set(eps.id);
    this.api.adminPlans(eps.id).subscribe({ next: v => this.plans.set(v), error: e => this.fail(e, 'No fue posible cargar los planes.') });
  }

  createEps() {
    this.run(this.api.createEps(this.newEps.code, this.newEps.name), 'EPS creada.', () => { this.newEps = { code: '', name: '' }; this.loadEps(); });
  }

  renameEps(eps: Eps) {
    const name = this.renames['eps-' + eps.id];
    if (!name?.trim()) return;
    this.run(this.api.updateEps(eps.id, { name }), 'EPS actualizada.', () => { delete this.renames['eps-' + eps.id]; this.loadEps(); });
  }

  toggleEps(eps: Eps) {
    const text = eps.active ? 'EPS desactivada: sus planes dejan de poder elegirse.' : 'EPS activada.';
    this.run(this.api.updateEps(eps.id, { active: !eps.active }), text, () => { this.loadEps(); this.reloadPlans(); });
  }

  createPlan() {
    const epsId = this.selectedEpsId();
    if (!epsId || !this.newPlan.regimeId) { this.error.set('Selecciona la EPS y el régimen del plan.'); return; }
    this.run(this.api.createPlan(epsId, this.newPlan.regimeId, this.newPlan.code, this.newPlan.name), 'Plan creado.', () => {
      this.newPlan = { code: '', name: '', regimeId: null };
      this.reloadPlans();
    });
  }

  changeRegime(plan: EpsPlan, regimeId: number) {
    this.run(this.api.updatePlan(plan.id, { regimeId: Number(regimeId) }), 'Régimen del plan actualizado.', () => this.reloadPlans());
  }

  renamePlan(plan: EpsPlan) {
    const name = this.renames['plan-' + plan.id];
    if (!name?.trim()) return;
    this.run(this.api.updatePlan(plan.id, { name }), 'Plan actualizado.', () => { delete this.renames['plan-' + plan.id]; this.reloadPlans(); });
  }

  togglePlan(plan: EpsPlan) {
    this.run(this.api.updatePlan(plan.id, { active: !plan.active }), plan.active ? 'Plan desactivado.' : 'Plan activado.', () => this.reloadPlans());
  }

  loadMailbox() {
    this.api.localMailbox().subscribe({
      next: v => this.mailbox.set(v),
      // 404: el backend no tiene habilitado el buzón local (fuera de desarrollo); no se muestra la sección.
      error: (e: unknown) => this.mailbox.set(e instanceof HttpErrorResponse && e.status === 404 ? null : []),
    });
  }

  private reloadPlans() {
    const id = this.selectedEpsId();
    const eps = this.eps().find(x => x.id === id);
    if (eps) this.selectEps(eps);
  }

  private run<T>(request: Observable<T>, success: string, after: () => void) {
    this.saving.set(true);
    this.error.set('');
    this.message.set('');
    request.subscribe({
      next: () => { this.message.set(success); this.saving.set(false); after(); },
      error: e => { this.fail(e, 'No fue posible guardar los cambios.'); this.saving.set(false); },
    });
  }

  private fail(e: unknown, fallback: string) { this.error.set(apiErrorMessage(e, fallback)); }
}
