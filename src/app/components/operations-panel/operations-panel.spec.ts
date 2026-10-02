import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuthSession, SessionRole } from '../../services/auth-session';
import { InboxItem, ProfessionalAppointment } from '../../services/operations-api';
import { OperationsPanel } from './operations-panel';

describe('OperationsPanel', () => {
  let http: HttpTestingController;
  const api = environment.apiUrl;

  function create(role: SessionRole) {
    TestBed.configureTestingModule({ imports: [OperationsPanel], providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(AuthSession).role.set(role);
    const fixture = TestBed.createComponent(OperationsPanel);
    http.expectOne(`${api}/catalogs/locations`).flush([{ id: '2', code: 'ICV', name: 'ICV', address: '', city: '', department: '' }]);
    return fixture;
  }

  function appointment(overrides: Partial<ProfessionalAppointment>): ProfessionalAppointment {
    return {
      id: 1, locationId: 1, locationCode: 'HIC', location: 'HIC', patient: 'Ana Prueba', specialty: 'Medicina General', durationMinutes: 30,
      startsAt: '2030-01-15T08:00:00', endsAt: '2030-01-15T08:30:00', reason: null, closable: false, ...overrides,
    };
  }

  afterEach(() => http.verify());

  it('HU-029 · loads the professional agenda by week and location', () => {
    const component = create('doctor').componentInstance;
    const first = http.expectOne(r => r.url === `${api}/professional/appointments`);
    expect(first.request.params.get('view')).toBe('WEEK');
    expect(first.request.params.get('date')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    first.flush([]);

    component.agendaFilter = { date: '2030-01-15', view: 'DAY', locationId: 2 };
    component.load();
    const filtered = http.expectOne(r => r.url === `${api}/professional/appointments`);
    expect(filtered.request.params.get('date')).toBe('2030-01-15');
    expect(filtered.request.params.get('view')).toBe('DAY');
    expect(filtered.request.params.get('locationId')).toBe('2');
    filtered.flush([appointment({})]);
    expect(component.agenda()[0].patient).toBe('Ana Prueba');
  });

  it('HU-030 · closes only finished appointments and reloads the agenda', () => {
    const fixture = create('doctor');
    const component = fixture.componentInstance;
    http.expectOne(r => r.url === `${api}/professional/appointments`).flush([appointment({ id: 1 }), appointment({ id: 2, closable: true })]);
    fixture.detectChanges();
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    expect(Array.from(buttons).filter(b => b.textContent?.includes('Completada')).length).toBe(1);

    component.close(component.agenda()[0], 'COMPLETED');
    http.expectNone(`${api}/professional/appointments/1/closure`);

    component.close(component.agenda()[1], 'NO_SHOW');
    const closure = http.expectOne(`${api}/professional/appointments/2/closure`);
    expect(closure.request.body).toEqual({ status: 'NO_SHOW' });
    closure.flush({ id: 2, status: 'NO_SHOW' });
    http.expectOne(r => r.url === `${api}/professional/appointments`).flush([]);
    expect(component.message()).toContain('no asistida');
  });

  it('HU-031 · filters the admin inbox and routes each kind of decision', () => {
    const component = create('admin').componentInstance;
    http.expectOne(`${api}/admin/professionals`).flush([]);
    http.expectOne(`${api}/admin/specialties`).flush([]);
    const initial = http.expectOne(r => r.url === `${api}/admin/inbox`);
    expect(initial.request.params.keys()).toEqual([]);
    initial.flush([]);

    component.inboxFilter = { locationId: 2, professionalId: 7, specialtyId: null, date: '2030-01-15' };
    component.load();
    const filtered = http.expectOne(r => r.url === `${api}/admin/inbox`);
    expect(filtered.request.params.get('locationId')).toBe('2');
    expect(filtered.request.params.get('professionalId')).toBe('7');
    expect(filtered.request.params.has('specialtyId')).toBe(false);
    expect(filtered.request.params.get('date')).toBe('2030-01-15');
    const reschedule: InboxItem = {
      kind: 'RESCHEDULE', requestId: 9, appointmentId: 4, locationId: 2, locationCode: 'ICV', patient: 'Ana', professional: 'Pro',
      specialty: 'Medicina General', startsAt: '2030-01-16T09:00:00', endsAt: '2030-01-16T09:30:00', currentStartsAt: '2030-01-15T08:00:00', reason: null,
    };
    filtered.flush([reschedule]);

    component.approve(component.inbox()[0]);
    http.expectOne(`${api}/admin/reschedule-requests/9/decision`).flush({ id: 9, status: 'APPROVED' });
    http.expectOne(r => r.url === `${api}/admin/inbox`).flush([]);
  });
});
