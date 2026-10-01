import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { apiErrorMessage } from './api-error';
import { OfferApi } from './offer-api';

describe('OfferApi', () => {
  let api: OfferApi;
  let http: HttpTestingController;
  const admin = `${environment.apiUrl}/admin`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(OfferApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates and updates specialties through the admin contract', () => {
    api.createSpecialty('DERMATOLOGIA', 'Dermatología', 60).subscribe();
    const create = http.expectOne(`${admin}/specialties`);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual({ code: 'DERMATOLOGIA', name: 'Dermatología', durationMinutes: 60 });
    create.flush({});

    api.updateSpecialty(7, { active: false }).subscribe();
    const update = http.expectOne(`${admin}/specialties/7`);
    expect(update.request.method).toBe('PATCH');
    expect(update.request.body).toEqual({ active: false });
    update.flush({});
  });

  it('replaces specialty and location assignments of a professional', () => {
    api.assignSpecialties(3, [{ specialtyId: 2, primary: true }, { specialtyId: 4, primary: false }]).subscribe();
    const specialties = http.expectOne(`${admin}/professionals/3/specialties`);
    expect(specialties.request.method).toBe('PUT');
    expect(specialties.request.body).toEqual({ assignments: [{ specialtyId: 2, primary: true }, { specialtyId: 4, primary: false }] });
    specialties.flush({});

    api.assignLocations(3, [1, 2]).subscribe();
    const locations = http.expectOne(`${admin}/professionals/3/locations`);
    expect(locations.request.method).toBe('PUT');
    expect(locations.request.body).toEqual({ locationIds: [1, 2] });
    locations.flush({});
  });

  it('toggles the professional status with PATCH', () => {
    api.setProfessionalActive(5, false).subscribe();
    const toggle = http.expectOne(`${admin}/professionals/5`);
    expect(toggle.request.method).toBe('PATCH');
    expect(toggle.request.body).toEqual({ active: false });
    toggle.flush({});
  });
});

describe('apiErrorMessage', () => {
  it('shows the Problem Details detail sent by the backend', () => {
    const error = new HttpErrorResponse({ status: 409, error: { detail: 'Código profesional o matrícula ya registrados' } });
    expect(apiErrorMessage(error, 'fallback')).toBe('Código profesional o matrícula ya registrados');
  });

  it('uses friendly messages for permission and connectivity errors', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 403 }), 'x')).toBe('No tienes permiso para realizar esta acción.');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 0 }), 'x')).toBe('No hay conexión con el servidor.');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 500, error: null }), 'fallback')).toBe('fallback');
  });
});
