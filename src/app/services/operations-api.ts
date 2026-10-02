import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type AgendaView = 'DAY' | 'WEEK';
export type Closure = 'COMPLETED' | 'NO_SHOW';
export type AppointmentStatusCode = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

/** HU-029 · Del paciente solo llega el nombre; `closable` indica que la cita ya terminó. */
export interface ProfessionalAppointment {
  id: number; locationId: number; locationCode: string; location: string; patient: string; specialty: string;
  durationMinutes: number; startsAt: string; endsAt: string; reason: string | null; closable: boolean;
}
/** HU-031 · `startsAt` es la franja a decidir; `currentStartsAt` la vigente de una reprogramación. */
export interface InboxItem {
  kind: 'SPECIALIZED_REQUEST' | 'RESCHEDULE'; requestId: number; appointmentId: number; locationId: number; locationCode: string;
  patient: string; professional: string; specialty: string; startsAt: string; endsAt: string; currentStartsAt: string | null; reason: string | null;
}
export interface InboxFilter { locationId?: number | null; professionalId?: number | null; specialtyId?: number | null; date?: string | null; }
/** HU-032 · Entrada inmutable del historial de estados. */
export interface HistoryEntry {
  id: number; previousStatus: AppointmentStatusCode | null; newStatus: AppointmentStatusCode; actorId: number | null;
  source: 'SYSTEM' | 'USER' | 'ADMIN'; reason: string | null; occurredAt: string;
}

/** Agenda y cierre del PROFESSIONAL, bandeja ADMIN e historial. El token y encabezados los agrega `authInterceptor`. */
@Injectable({ providedIn: 'root' })
export class OperationsApi {
  private readonly http = inject(HttpClient);

  agenda(date: string, view: AgendaView, locationId?: number | null) {
    let params = new HttpParams().set('date', date).set('view', view);
    if (locationId) params = params.set('locationId', locationId);
    return this.http.get<ProfessionalAppointment[]>(`${environment.apiUrl}/professional/appointments`, { params });
  }
  close(id: number, status: Closure) {
    return this.http.post<{ id: number; status: Closure }>(`${environment.apiUrl}/professional/appointments/${id}/closure`, { status });
  }
  inbox(filter: InboxFilter = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filter)) if (value) params = params.set(key, value);
    return this.http.get<InboxItem[]>(`${environment.apiUrl}/admin/inbox`, { params });
  }
  history(appointmentId: number) { return this.http.get<HistoryEntry[]>(`${environment.apiUrl}/appointments/${appointmentId}/history`); }
  /** HU-024 · Aprobar o rechazar (con motivo obligatorio) una solicitud especializada. */
  decide(appointmentId: number, decision: 'APPROVE' | 'REJECT', reason?: string) {
    return this.http.post<{ id: number; status: string }>(`${environment.apiUrl}/admin/appointments/${appointmentId}/decision`, { decision, reason });
  }
  /** HU-028 · Aprobar (mueve la cita) o rechazar con motivo (libera la franja retenida) una reprogramación. */
  decideReschedule(requestId: number, decision: 'APPROVE' | 'REJECT', reason?: string) {
    return this.http.post<{ id: number; status: string }>(`${environment.apiUrl}/admin/reschedule-requests/${requestId}/decision`, { decision, reason });
  }
}
