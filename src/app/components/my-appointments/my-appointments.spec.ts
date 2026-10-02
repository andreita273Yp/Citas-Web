import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Appointment } from '../../services/appointment-api';
import { MyAppointments } from './my-appointments';

describe('MyAppointments', () => {
  let http: HttpTestingController;
  let component: MyAppointments;
  const api = environment.apiUrl;
  const future = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 19);
  const past = new Date(Date.now() - 86_400_000).toISOString().slice(0, 19);

  function appointment(overrides: Partial<Appointment>): Appointment {
    return {
      id: 1, status: 'APPROVED', locationId: 1, locationCode: 'HIC', location: 'HIC', professionalId: 7, professional: 'Pro',
      specialtyId: 1, specialty: 'Medicina General', durationMinutes: 30, startsAt: future, endsAt: future, reason: null,
      decisionReason: null, reschedule: null, ...overrides,
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MyAppointments], providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    component = TestBed.createComponent(MyAppointments).componentInstance;
    http.expectOne(`${api}/catalogs/locations`).flush([]);
    http.expectOne(r => r.url === `${api}/appointments`).flush([]);
  });

  afterEach(() => http.verify());

  it('offers cancel and reschedule only where the business rules allow them', () => {
    expect(component.cancellable(appointment({}))).toBe(true);
    expect(component.cancellable(appointment({ status: 'REQUESTED' }))).toBe(true);
    expect(component.cancellable(appointment({ status: 'CANCELLED' }))).toBe(false);
    expect(component.cancellable(appointment({ startsAt: past }))).toBe(false);

    expect(component.reschedulable(appointment({}))).toBe(true);
    expect(component.reschedulable(appointment({ status: 'REQUESTED' }))).toBe(false);
    const pending = { id: 9, appointmentId: 1, status: 'PENDING' as const, locationId: 1, locationCode: 'HIC', startAt: future, endAt: future, decisionReason: null, patientAction: null };
    expect(component.reschedulable(appointment({ reschedule: pending }))).toBe(false);
    expect(component.awaitingChoice(appointment({ reschedule: { ...pending, status: 'REJECTED', decisionReason: 'No' } }))).toBe(true);
  });

  it('searches the same professional and specialty and requests the chosen slot', () => {
    component.openReschedule(appointment({ id: 5, professionalId: 7, specialtyId: 2 }));
    component.rescheduleDate = '2030-01-15';
    component.searchSlots();
    const search = http.expectOne(r => r.url === `${api}/availability`);
    expect(search.request.params.get('professionalId')).toBe('7');
    expect(search.request.params.get('specialtyId')).toBe('2');
    search.flush([{ professionalId: 7, professionalName: 'Pro', locationId: 2, locationCode: 'ICV', startAt: '2030-01-15T09:00:00', endAt: '2030-01-15T09:30:00', durationMinutes: 30 }]);

    component.requestReschedule(component.options()[0]);
    const request = http.expectOne(`${api}/appointments/5/reschedule-requests`);
    expect(request.request.body).toEqual({ startAt: '2030-01-15T09:00', locationId: 2 });
    request.flush({});
    http.expectOne(r => r.url === `${api}/appointments`).flush([]);
    expect(component.rescheduling()).toBeNull();
    expect(component.message()).toContain('se mantiene');
  });

  it('on 409 shows the backend reason and refreshes appointments and slots', () => {
    component.openReschedule(appointment({ id: 5 }));
    component.rescheduleDate = '2030-01-15';
    component.requestReschedule({ professionalId: 7, professionalName: 'Pro', locationId: 1, locationCode: 'HIC', startAt: '2030-01-15T09:00:00', endAt: '', durationMinutes: 30 });
    http.expectOne(`${api}/appointments/5/reschedule-requests`).flush({ detail: 'La nueva franja ya no está disponible' }, { status: 409, statusText: 'Conflict' });
    expect(component.error()).toBe('La nueva franja ya no está disponible');
    http.expectOne(r => r.url === `${api}/appointments`).flush([]);
    http.expectOne(r => r.url === `${api}/availability`).flush([]);
  });
});
