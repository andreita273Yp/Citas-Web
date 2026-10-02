import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AvailableStart } from '../../services/booking-api';
import { BookAppointment } from './book-appointment';

describe('BookAppointment', () => {
  let http: HttpTestingController;
  let component: BookAppointment;
  const api = environment.apiUrl;
  const start: AvailableStart = {
    professionalId: 3, professionalName: 'Pro Sintético', locationId: 1, locationCode: 'HIC',
    startAt: '2030-01-15T08:00:00', endAt: '2030-01-15T09:00:00', durationMinutes: 60,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [BookAppointment], providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    component = TestBed.createComponent(BookAppointment).componentInstance;
    http.expectOne(`${api}/catalogs/locations`).flush([]);
    http.expectOne(r => r.url === `${api}/catalogs/specialties`).flush([
      { id: 12, code: 'NEUROLOGIA', name: 'Neurología', durationMinutes: 60, general: false, requiresAdminApproval: true },
    ]);
    component.specialtyId = 12;
    component.date = '2030-01-15';
  });

  afterEach(() => http.verify());

  function searchReturning(starts: AvailableStart[]) {
    component.search();
    http.expectOne(r => r.url === `${api}/availability`).flush(starts);
  }

  it('shows the status decided by the backend instead of assuming approval', () => {
    searchReturning([start]);
    component.choose(start);
    component.confirm();
    const book = http.expectOne(`${api}/appointments`);
    expect(book.request.body.startAt).toBe('2030-01-15T08:00');
    book.flush({ id: 1, status: 'REQUESTED', professionalId: 3, locationId: 1, specialtyId: 12, startAt: start.startAt, endAt: start.endAt, durationMinutes: 60 });
    expect(component.booked()?.status).toBe('REQUESTED');
    // Tras reservar, la disponibilidad se recarga sola y el horario tomado ya no aparece.
    http.expectOne(r => r.url === `${api}/availability`).flush([]);
    expect(component.starts()).toEqual([]);
    expect(component.booked()?.status).toBe('REQUESTED');
  });

  it('on 409 explains the slot was taken and refreshes availability', () => {
    searchReturning([start]);
    component.choose(start);
    component.confirm();
    http.expectOne(`${api}/appointments`).flush({ detail: 'El horario ya no está disponible' }, { status: 409, statusText: 'Conflict' });
    http.expectOne(r => r.url === `${api}/availability`).flush([]);
    expect(component.error()).toContain('acaba de ser tomado');
    expect(component.booked()).toBeNull();
    expect(component.selected()).toBeNull();
  });

  it('shows the backend validation message on other errors', () => {
    searchReturning([start]);
    component.choose(start);
    component.confirm();
    http.expectOne(`${api}/appointments`).flush({ detail: 'No se permiten citas en el pasado' }, { status: 400, statusText: 'Bad Request' });
    expect(component.error()).toBe('No se permiten citas en el pasado');
    expect(component.booking()).toBe(false);
  });
});
