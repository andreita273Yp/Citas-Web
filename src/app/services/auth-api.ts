import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface LoginResponse { accessToken: string; tokenType: 'Bearer'; expiresIn: number; }
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  password: string;
  insurancePlanId?: number;
}
export interface RegisteredUser {
  id: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly headers = new HttpHeaders({ 'X-Requested-With': 'XMLHttpRequest' });
  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password }, { headers: this.headers, withCredentials: true });
  }
  register(request: RegisterRequest) {
    return this.http.post<RegisteredUser>(`${environment.apiUrl}/auth/register`, request, { headers: this.headers, withCredentials: true });
  }
  refresh() {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/refresh`, {}, { headers: this.headers, withCredentials: true });
  }
  logout() {
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}, { headers: this.headers, withCredentials: true });
  }
}
