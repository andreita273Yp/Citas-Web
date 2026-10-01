import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Eps { id: number; code: string; name: string; active: boolean; }
export interface EpsPlan {
  id: number; epsId: number; epsName: string; regimeId: number; regimeCode: string; regimeName: string;
  code: string; name: string; active: boolean;
}
export interface Regime { id: number; code: string; name: string; }
export interface Affiliation {
  planId: number; planName: string; epsId: number; epsName: string; regimeCode: string; regimeName: string;
  membershipNumber: string; validFrom: string | null;
}
export interface Profile { id: string; firstName: string; lastName: string; documentType: string; documentNumber: string; email: string; phone: string; roles: string[]; }
export interface RecoveryMessage { email: string; token: string; expiresAt: string; createdAt: string; }

/** HU-008 a HU-013 · Perfil, afiliación, recuperación de contraseña y catálogos EPS/planes. */
@Injectable({ providedIn: 'root' })
export class IdentityApi {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  // Catálogo de selección (público, también para el registro): solo EPS y planes activos.
  eps() { return this.http.get<Eps[]>(`${this.api}/catalogs/eps`); }
  plans(epsId: number) { return this.http.get<EpsPlan[]>(`${this.api}/catalogs/eps-plans`, { params: { epsId } }); }
  regimes() { return this.http.get<Regime[]>(`${this.api}/catalogs/regimes`); }

  // Recuperación de contraseña (HU-008/009).
  recover(email: string) { return this.http.post<void>(`${this.api}/auth/password-recovery`, { email }); }
  reset(token: string, password: string, confirmation: string) { return this.http.post<void>(`${this.api}/auth/password-reset`, { token, password, confirmation }); }

  // Perfil (HU-010): solo el teléfono es editable.
  me() { return this.http.get<Profile>(`${this.api}/users/me`); }
  updatePhone(phone: string) { return this.http.patch<Profile>(`${this.api}/users/me`, { phone }); }

  // Afiliación propia (HU-011): EPS y régimen se derivan del plan. 204 = sin afiliación.
  affiliation() { return this.http.get<Affiliation | null>(`${this.api}/users/me/affiliation`, { observe: 'response' }).pipe(map(r => r.body ?? null)); }
  saveAffiliation(planId: number, membershipNumber: string) { return this.http.put<Affiliation>(`${this.api}/users/me/affiliation`, { planId, membershipNumber }); }
  endAffiliation() { return this.http.delete<void>(`${this.api}/users/me/affiliation`); }

  // Administración (HU-012/013): CRUD lógico, sin borrado.
  adminEps() { return this.http.get<Eps[]>(`${this.api}/admin/eps`); }
  createEps(code: string, name: string) { return this.http.post<Eps>(`${this.api}/admin/eps`, { code, name }); }
  updateEps(id: number, change: { name?: string; active?: boolean }) { return this.http.patch<Eps>(`${this.api}/admin/eps/${id}`, change); }
  adminPlans(epsId?: number) { return this.http.get<EpsPlan[]>(`${this.api}/admin/eps-plans`, epsId ? { params: { epsId } } : {}); }
  createPlan(epsId: number, regimeId: number, code: string, name: string) { return this.http.post<EpsPlan>(`${this.api}/admin/eps-plans`, { epsId, regimeId, code, name }); }
  updatePlan(id: number, change: { name?: string; regimeId?: number; active?: boolean }) { return this.http.patch<EpsPlan>(`${this.api}/admin/eps-plans/${id}`, change); }

  /** Buzón local de desarrollo (solo ADMIN y solo si el backend lo habilita). */
  localMailbox() { return this.http.get<RecoveryMessage[]>(`${this.api}/admin/local-mailbox/password-recovery`); }
}
