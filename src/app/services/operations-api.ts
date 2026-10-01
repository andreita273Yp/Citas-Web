import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface ProfessionalAppointment { id: string; locationId: string; location: string; patient: string; specialty: string; startsAt: string; endsAt: string; reason?: string; }
export interface InboxItem { kind: string; requestId: string; appointmentId: string; locationId: string; patient: string; professional: string; specialty: string; startsAt: string; endsAt: string; }

/** Agenda del PROFESSIONAL y bandeja ADMIN. El token y encabezados los agrega `authInterceptor`. */
@Injectable({ providedIn: 'root' })
export class OperationsApi {
  private readonly http = inject(HttpClient);
  agenda() { return this.http.get<ProfessionalAppointment[]>(`${environment.apiUrl}/professional/appointments`); }
  close(id: string, status: 'COMPLETED' | 'NO_SHOW') { return this.http.post(`${environment.apiUrl}/professional/appointments/${id}/closure`, { status }); }
  inbox() { return this.http.get<InboxItem[]>(`${environment.apiUrl}/admin/inbox`); }
}
