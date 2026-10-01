import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Eps { id: number; name: string; active: boolean; }
export interface EpsPlan { id: number; epsId: number; name: string; active: boolean; }
export interface Profile { id: string; firstName: string; lastName: string; documentType: string; documentNumber: string; email: string; phone: string; roles: string[]; }

/** Perfil, afiliación, EPS/planes y recuperación. El token y encabezados los agrega `authInterceptor`. */
@Injectable({ providedIn: 'root' })
export class IdentityApi {
  private readonly http = inject(HttpClient);
  eps() { return this.http.get<Eps[]>(`${environment.apiUrl}/catalogs/eps`); }
  plans(epsId: number) { return this.http.get<EpsPlan[]>(`${environment.apiUrl}/catalogs/eps-plans`, { params: { epsId } }); }
  recover(email: string) { return this.http.post(`${environment.apiUrl}/auth/password-recovery`, { email }); }
  reset(token: string, password: string, confirmation: string) { return this.http.post(`${environment.apiUrl}/auth/password-reset`, { token, password, confirmation }); }
  me() { return this.http.get<Profile>(`${environment.apiUrl}/users/me`); }
  updatePhone(phone: string) { return this.http.patch<Profile>(`${environment.apiUrl}/users/me`, { phone }); }
  affiliation() { return this.http.get<Record<string, unknown>>(`${environment.apiUrl}/users/me/affiliation`); }
  saveAffiliation(insurancePlanId: number, regimeCode: string) { return this.http.put(`${environment.apiUrl}/users/me/affiliation`, { insurancePlanId, regimeCode }); }
  adminEps() { return this.http.get<Eps[]>(`${environment.apiUrl}/admin/eps`); }
  createEps(name: string) { return this.http.post<Eps>(`${environment.apiUrl}/admin/eps`, { name }); }
  updateEps(id: number, active: boolean) { return this.http.patch(`${environment.apiUrl}/admin/eps/${id}`, { active }); }
  adminPlans() { return this.http.get<EpsPlan[]>(`${environment.apiUrl}/admin/eps-plans`); }
  createPlan(epsId: number, name: string) { return this.http.post<EpsPlan>(`${environment.apiUrl}/admin/eps-plans`, { epsId, name }); }
}
