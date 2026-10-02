import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { StatusHistory } from './status-history';

describe('StatusHistory', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StatusHistory], providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('HU-032 · loads the read-only history only when opened and shows each transition', () => {
    const fixture = TestBed.createComponent(StatusHistory);
    fixture.componentRef.setInput('appointmentId', 5);
    fixture.detectChanges();
    http.expectNone(`${environment.apiUrl}/appointments/5/history`);

    fixture.componentInstance.toggle();
    const request = http.expectOne(`${environment.apiUrl}/appointments/5/history`);
    expect(request.request.method).toBe('GET');
    request.flush([
      { id: 1, previousStatus: null, newStatus: 'REQUESTED', actorId: 3, source: 'USER', reason: null, occurredAt: '2030-01-10T10:00:00' },
      { id: 2, previousStatus: 'REQUESTED', newStatus: 'REJECTED', actorId: 1, source: 'ADMIN', reason: 'Sin remisión', occurredAt: '2030-01-11T10:00:00' },
    ]);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Solicitada → Rechazada');
    expect(text).toContain('Administración');
    expect(text).toContain('Sin remisión');
  });

  it('shows the API problem detail when the history is not accessible', () => {
    const fixture = TestBed.createComponent(StatusHistory);
    fixture.componentRef.setInput('appointmentId', 8);
    fixture.componentInstance.toggle();
    http.expectOne(`${environment.apiUrl}/appointments/8/history`)
      .flush({ detail: 'Cita no existe' }, { status: 404, statusText: 'Not Found' });
    expect(fixture.componentInstance.error()).toBe('Cita no existe');
  });
});
