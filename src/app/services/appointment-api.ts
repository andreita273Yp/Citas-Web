import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthSession } from './auth-session';

export interface Appointment {
  id: string; locationId: string; location: string; professional: string; specialty: string;
  durationMinutes: number; startsAt: string; endsAt: string; status: string;
  reason?: string | null; decisionReason?: string | null;
}
@Injectable({ providedIn: 'root' })
export class AppointmentApi {
  private readonly http = inject(HttpClient); private readonly session = inject(AuthSession);
  private headers() { return new HttpHeaders({ Authorization: `Bearer ${this.session.accessToken() ?? ''}`, 'X-Requested-With': 'XMLHttpRequest' }); }
  mine() { return this.http.get<Appointment[]>(`${environment.apiUrl}/appointments`, { headers: this.headers() }); }
  cancel(id: string) { return this.http.post<Appointment>(`${environment.apiUrl}/appointments/${id}/cancel`, {}, { headers: this.headers() }); }
  reschedule(id: string, startAt: string, locationId: string, reason?: string) { return this.http.post(`${environment.apiUrl}/appointments/${id}/reschedule-requests`, { startAt, locationId, reason }, { headers: this.headers() }); }
}
