import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthSession } from './auth-session';
export interface ProfessionalAppointment { id:string; locationId:string; location:string; patient:string; specialty:string; startsAt:string; endsAt:string; reason?:string; }
export interface InboxItem { kind:string; requestId:string; appointmentId:string; locationId:string; patient:string; professional:string; specialty:string; startsAt:string; endsAt:string; }
@Injectable({providedIn:'root'})
export class OperationsApi {
 private http=inject(HttpClient); private session=inject(AuthSession);
 private headers(){return new HttpHeaders({Authorization:`Bearer ${this.session.accessToken()??''}`,'X-Requested-With':'XMLHttpRequest'});}
 agenda(){return this.http.get<ProfessionalAppointment[]>(`${environment.apiUrl}/professional/appointments`,{headers:this.headers()});}
 close(id:string,status:'COMPLETED'|'NO_SHOW'){return this.http.post(`${environment.apiUrl}/professional/appointments/${id}/closure`,{status},{headers:this.headers()});}
 inbox(){return this.http.get<InboxItem[]>(`${environment.apiUrl}/admin/inbox`,{headers:this.headers()});}
}
