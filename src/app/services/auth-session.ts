import { Injectable, signal } from '@angular/core';
import { LoginResponse } from './auth-api';

export type SessionRole = 'patient' | 'doctor' | 'admin';

@Injectable({ providedIn: 'root' })
export class AuthSession {
  readonly accessToken = signal<string | null>(null);
  readonly role = signal<SessionRole>('patient');

  start(response: LoginResponse) {
    this.accessToken.set(response.accessToken);
    this.role.set(roleFromAccessToken(response.accessToken));
  }

  clear() {
    this.accessToken.set(null);
    this.role.set('patient');
  }
}

function roleFromAccessToken(token: string): SessionRole {
  try {
    const encodedPayload = token.split('.')[1];
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'))) as { roles?: string[] };
    if (payload.roles?.includes('ADMIN')) return 'admin';
    if (payload.roles?.includes('PROFESSIONAL')) return 'doctor';
  } catch {
    // The backend remains the authority; an unreadable token gets the least privileged UI role.
  }
  return 'patient';
}
