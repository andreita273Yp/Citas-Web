import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface AgendaBlock {
  id: number; locationId: number; locationCode: string; date: string; startTime: string; endTime: string; slots: number; bookedSlots: number;
}
export interface BlockInput { locationId: number; date: string; startTime: string; endTime: string; }
export interface ProfessionalProfile {
  id: number; firstName: string; lastName: string; active: boolean;
  locations: { id: number; code: string; name: string }[];
  specialties: { id: number; name: string; durationMinutes: number; primary: boolean }[];
}
export interface BlockFilter { from?: string; to?: string; locationId?: number | null; }

/** HU-018 a HU-020 · Agenda propia del PROFESSIONAL. */
@Injectable({ providedIn: 'root' })
export class AgendaApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/professional`;

  me() { return this.http.get<ProfessionalProfile>(`${this.base}/me`); }
  blocks(filter: BlockFilter = {}) {
    let params = new HttpParams();
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);
    if (filter.locationId) params = params.set('locationId', filter.locationId);
    return this.http.get<AgendaBlock[]>(`${this.base}/blocks`, { params });
  }
  create(block: BlockInput) { return this.http.post<AgendaBlock>(`${this.base}/blocks`, block); }
  update(id: number, block: BlockInput) { return this.http.put<AgendaBlock>(`${this.base}/blocks/${id}`, block); }
  remove(id: number) { return this.http.delete<void>(`${this.base}/blocks/${id}`); }
}
