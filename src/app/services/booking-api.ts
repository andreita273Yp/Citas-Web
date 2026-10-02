import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type AppointmentType = 'GENERAL' | 'SPECIALIZED';
export interface SpecialtyOption { id: number; code: string; name: string; durationMinutes: number; general: boolean; requiresAdminApproval: boolean; }
export interface ProfessionalOption { id: number; name: string; professionalCode: string; }
export interface LocationOption { id: string; code: string; name: string; address: string; city: string; department: string; }
export interface AvailableStart {
  professionalId: number; professionalName: string; locationId: number; locationCode: string;
  startAt: string; endAt: string; durationMinutes: number;
}
export interface AvailabilityFilter { specialtyId: number; date: string; locationId?: number | null; professionalId?: number | null; }
export interface BookingRequest { professionalId: number; locationId: number; specialtyId: number; startAt: string; reason?: string; }
export interface Booked {
  id: number; status: 'APPROVED' | 'REQUESTED'; professionalId: number; locationId: number; specialtyId: number;
  startAt: string; endAt: string; durationMinutes: number;
}

/** HU-021 a HU-023 · Búsqueda de oferta y reserva del USER contra citas-api. */
@Injectable({ providedIn: 'root' })
export class BookingApi {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  locations() { return this.http.get<LocationOption[]>(`${this.api}/catalogs/locations`); }
  specialties(type: AppointmentType) { return this.http.get<SpecialtyOption[]>(`${this.api}/catalogs/specialties`, { params: { type } }); }
  professionals(specialtyId: number, locationId: number) {
    return this.http.get<ProfessionalOption[]>(`${this.api}/catalogs/professionals`, { params: { specialtyId, locationId } });
  }
  availability(filter: AvailabilityFilter) {
    let params = new HttpParams().set('specialtyId', filter.specialtyId).set('date', filter.date);
    if (filter.locationId) params = params.set('locationId', filter.locationId);
    if (filter.professionalId) params = params.set('professionalId', filter.professionalId);
    return this.http.get<AvailableStart[]>(`${this.api}/availability`, { params });
  }
  book(request: BookingRequest) { return this.http.post<Booked>(`${this.api}/appointments`, request); }
}
