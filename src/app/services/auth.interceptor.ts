import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthSession } from './auth-session';
import { SessionRefresher } from './session-refresher';

const AUTH_PREFIX = `${environment.apiUrl}/auth/`;

/**
 * Para peticiones a citas-api: agrega `X-Requested-With` y el access Bearer en memoria. Si una petición
 * autenticada recibe 401, renueva la sesión una vez y la reintenta; si la renovación falla, la sesión se cierra.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.apiUrl)) return next(request);
  const session = inject(AuthSession);
  const refresher = inject(SessionRefresher);

  if (request.url.startsWith(AUTH_PREFIX)) return next(withApiHeaders(request, null).clone({ withCredentials: true }));

  const sentWithToken = session.accessToken();
  return next(withApiHeaders(request, sentWithToken)).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !sentWithToken) return throwError(() => error);
      return refresher.refresh().pipe(switchMap(token => next(withApiHeaders(request, token))));
    }),
  );
};

function withApiHeaders(request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  const setHeaders: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' };
  if (token) setHeaders['Authorization'] = `Bearer ${token}`;
  return request.clone({ setHeaders });
}
