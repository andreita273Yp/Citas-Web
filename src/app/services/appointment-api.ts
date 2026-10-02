import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type AppointmentStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type RescheduleStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export interface Reschedule {
  id: number; appointmentId: number; status: RescheduleStatus; locationId: number; locationCode: string;
  startAt: string; endAt: string; decisionReason: string | null; patientAction: 'KEEP_APPOINTMENT' | 'CANCEL_APPOINTMENT' | null;
}
export interface Appointment {
  id: number; status: AppointmentStatus; locationId: number; locationCode: string; location: string;
  professionalId: number; professional: string; specialtyId: number; specialty: string; durationMinutes: number;
  startsAt: string; endsAt: string; reason: string | null; decisionReason: string | null; reschedule: Reschedule | null;
}
export interface AppointmentFilter { status?: AppointmentStatus | ''; from?: string; to?: string; }

/** HU-025 a HU-028 · Citas propias del USER. El token y encabezados los agrega `authInterceptor`. */
@Injectable({ providedIn: 'root' })
export class AppointmentApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/appointments`;

  mine(filter: AppointmentFilter = {}) {
    let params = new HttpParams();
    if (filter.status) params = params.set('status', filter.status);
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);
    return this.http.get<Appointment[]>(this.base, { params });
  }
  detail(id: number) { return this.http.get<Appointment>(`${this.base}/${id}`); }
  cancel(id: number) { return this.http.post<Appointment>(`${this.base}/${id}/cancel`, {}); }
  reschedule(id: number, startAt: string, locationId: number) {
    return this.http.post<Reschedule>(`${this.base}/${id}/reschedule-requests`, { startAt, locationId });
  }
  keepAfterRejection(id: number, requestId: number) { return this.http.post<void>(`${this.base}/${id}/reschedule-requests/${requestId}/keep`, {}); }
}
