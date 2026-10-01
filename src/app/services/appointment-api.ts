import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Appointment {
  id: string; locationId: string; location: string; professional: string; specialty: string;
  durationMinutes: number; startsAt: string; endsAt: string; status: string;
  reason?: string | null; decisionReason?: string | null;
}

/** Citas propias del USER. El token y encabezados los agrega `authInterceptor`. */
@Injectable({ providedIn: 'root' })
export class AppointmentApi {
  private readonly http = inject(HttpClient);
  mine() { return this.http.get<Appointment[]>(`${environment.apiUrl}/appointments`); }
  cancel(id: string) { return this.http.post<Appointment>(`${environment.apiUrl}/appointments/${id}/cancel`, {}); }
  reschedule(id: string, startAt: string, locationId: string) { return this.http.post(`${environment.apiUrl}/appointments/${id}/reschedule-requests`, { startAt, locationId }); }
}
