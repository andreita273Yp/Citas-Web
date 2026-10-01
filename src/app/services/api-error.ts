import { HttpErrorResponse } from '@angular/common/http';

/** Mensaje para la UI a partir de un error de citas-api (Problem Details usa `detail`). */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) return 'No hay conexión con el servidor.';
  if (error.status === 401) return 'Tu sesión expiró. Inicia sesión de nuevo.';
  if (error.status === 403) return 'No tienes permiso para realizar esta acción.';
  const detail = (error.error as { detail?: unknown } | null)?.detail;
  return typeof detail === 'string' && detail.trim() ? detail : fallback;
}
