import { inject, Injectable } from '@angular/core';
import { catchError, finalize, firstValueFrom, map, Observable, of, shareReplay, throwError } from 'rxjs';
import { AuthApi } from './auth-api';
import { AuthSession } from './auth-session';

/**
 * Renueva el access token con la cookie refresh HttpOnly. Las peticiones que fallan con 401 al mismo tiempo
 * comparten una única renovación, porque el backend rota el refresh y solo acepta su primer uso.
 */
@Injectable({ providedIn: 'root' })
export class SessionRefresher {
  private readonly api = inject(AuthApi);
  private readonly session = inject(AuthSession);
  private inFlight: Observable<string> | null = null;

  refresh(): Observable<string> {
    this.inFlight ??= this.api.refresh().pipe(
      map(response => {
        this.session.start(response);
        return response.accessToken;
      }),
      catchError(error => {
        this.session.clear();
        return throwError(() => error);
      }),
      finalize(() => (this.inFlight = null)),
      shareReplay(1),
    );
    return this.inFlight;
  }

  /** Al cargar la app recupera la sesión si el navegador conserva una cookie refresh vigente. */
  restore(): Promise<void> {
    return firstValueFrom(this.refresh().pipe(map(() => undefined), catchError(() => of(undefined))));
  }
}
