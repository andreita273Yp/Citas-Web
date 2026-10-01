import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthSession } from './auth-session';

export interface Eps { id: number; name: string; active: boolean; }
export interface EpsPlan { id: number; epsId: number; name: string; active: boolean; }
export interface Profile { id: string; firstName: string; lastName: string; documentType: string; documentNumber: string; email: string; phone: string; roles: string[]; }

@Injectable({ providedIn: 'root' })
export class IdentityApi {
  private readonly http = inject(HttpClient);
  private readonly session = inject(AuthSession);
  private headers() { return new HttpHeaders({ Authorization: `Bearer ${this.session.accessToken() ?? ''}`, 'X-Requested-With': 'XMLHttpRequest' }); }
  eps() { return this.http.get<Eps[]>(`${environment.apiUrl}/catalogs/eps`); }
  plans(epsId: number) { return this.http.get<EpsPlan[]>(`${environment.apiUrl}/catalogs/eps-plans`, { params: { epsId } }); }
  recover(email: string) { return this.http.post(`${environment.apiUrl}/auth/password-recovery`, { email }, { headers: new HttpHeaders({ 'X-Requested-With': 'XMLHttpRequest' }) }); }
  reset(token: string, password: string, confirmation: string) { return this.http.post(`${environment.apiUrl}/auth/password-reset`, { token, password, confirmation }, { headers: new HttpHeaders({ 'X-Requested-With': 'XMLHttpRequest' }) }); }
  me() { return this.http.get<Profile>(`${environment.apiUrl}/users/me`, { headers: this.headers() }); }
  updatePhone(phone: string) { return this.http.patch<Profile>(`${environment.apiUrl}/users/me`, { phone }, { headers: this.headers() }); }
  affiliation() { return this.http.get<Record<string, unknown>>(`${environment.apiUrl}/users/me/affiliation`, { headers: this.headers() }); }
  saveAffiliation(insurancePlanId: number, regimeCode: string) { return this.http.put(`${environment.apiUrl}/users/me/affiliation`, { insurancePlanId, regimeCode }, { headers: this.headers() }); }
  adminEps() { return this.http.get<Eps[]>(`${environment.apiUrl}/admin/eps`, { headers: this.headers() }); }
  createEps(name: string) { return this.http.post<Eps>(`${environment.apiUrl}/admin/eps`, { name }, { headers: this.headers() }); }
  updateEps(id: number, active: boolean) { return this.http.patch(`${environment.apiUrl}/admin/eps/${id}`, { active }, { headers: this.headers() }); }
  adminPlans() { return this.http.get<EpsPlan[]>(`${environment.apiUrl}/admin/eps-plans`, { headers: this.headers() }); }
  createPlan(epsId: number, name: string) { return this.http.post<EpsPlan>(`${environment.apiUrl}/admin/eps-plans`, { epsId, name }, { headers: this.headers() }); }
}
