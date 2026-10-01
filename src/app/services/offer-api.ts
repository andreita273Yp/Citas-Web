import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Specialty {
  id: number; code: string; name: string; durationMinutes: 30 | 60;
  general: boolean; requiresAdminApproval: boolean; active: boolean;
}
export interface AssignedSpecialty { id: number; code: string; name: string; durationMinutes: number; primary: boolean; }
export interface AssignedLocation { id: number; code: string; name: string; }
export interface Professional {
  id: number; userId: number; firstName: string; lastName: string; email: string; phone: string;
  professionalCode: string; licenseNumber: string; active: boolean;
  specialties: AssignedSpecialty[]; locations: AssignedLocation[];
}
export interface NewProfessional {
  firstName: string; lastName: string; documentType: string; documentNumber: string; email: string; phone: string;
  initialPassword: string; professionalCode: string; licenseNumber: string;
}
export interface Location { id: string; code: string; name: string; address: string; city: string; department: string; }

/** HU-014 a HU-017 · Administración de especialidades y profesionales (solo ADMIN). */
@Injectable({ providedIn: 'root' })
export class OfferApi {
  private readonly http = inject(HttpClient);
  private readonly admin = `${environment.apiUrl}/admin`;

  specialties() { return this.http.get<Specialty[]>(`${this.admin}/specialties`); }
  createSpecialty(code: string, name: string, durationMinutes: number) {
    return this.http.post<Specialty>(`${this.admin}/specialties`, { code, name, durationMinutes });
  }
  updateSpecialty(id: number, change: Partial<Pick<Specialty, 'name' | 'durationMinutes' | 'active'>>) {
    return this.http.patch<Specialty>(`${this.admin}/specialties/${id}`, change);
  }

  professionals() { return this.http.get<Professional[]>(`${this.admin}/professionals`); }
  createProfessional(professional: NewProfessional) { return this.http.post<Professional>(`${this.admin}/professionals`, professional); }
  setProfessionalActive(id: number, active: boolean) { return this.http.patch<Professional>(`${this.admin}/professionals/${id}`, { active }); }
  assignSpecialties(id: number, assignments: { specialtyId: number; primary: boolean }[]) {
    return this.http.put<Professional>(`${this.admin}/professionals/${id}/specialties`, { assignments });
  }
  assignLocations(id: number, locationIds: number[]) {
    return this.http.put<Professional>(`${this.admin}/professionals/${id}/locations`, { locationIds });
  }

  locations() { return this.http.get<Location[]>(`${environment.apiUrl}/catalogs/locations`); }
}
