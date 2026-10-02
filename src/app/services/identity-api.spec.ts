import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { Affiliation, IdentityApi } from './identity-api';

describe('IdentityApi', () => {
  let api: IdentityApi;
  let http: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(IdentityApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('treats 204 as "no affiliation" and sends only plan and membership (regime comes from the plan)', () => {
    let current: Affiliation | null | undefined;
    api.affiliation().subscribe(a => (current = a));
    http.expectOne(`${base}/users/me/affiliation`).flush(null, { status: 204, statusText: 'No Content' });
    expect(current).toBeNull();

    api.saveAffiliation(5, 'AF-001').subscribe();
    const save = http.expectOne(`${base}/users/me/affiliation`);
    expect(save.request.method).toBe('PUT');
    expect(save.request.body).toEqual({ planId: 5, membershipNumber: 'AF-001' });
    save.flush({});
  });

  it('updates only the phone of the own profile', () => {
    api.updatePhone('3001234567').subscribe();
    const patch = http.expectOne(`${base}/users/me`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ phone: '3001234567' });
    patch.flush({});
  });

  it('requests recovery and resets with token and confirmation', () => {
    api.recover('ana@example.com').subscribe();
    expect(http.expectOne(`${base}/auth/password-recovery`).request.body).toEqual({ email: 'ana@example.com' });
    api.reset('tok', 'nueva-clave', 'nueva-clave').subscribe();
    expect(http.expectOne(`${base}/auth/password-reset`).request.body).toEqual({ token: 'tok', password: 'nueva-clave', confirmation: 'nueva-clave' });
  });

  it('creates plans with an explicit regime and deactivates instead of deleting', () => {
    api.createPlan(2, 1, 'A-CONTRIB', 'Plan A').subscribe();
    const create = http.expectOne(`${base}/admin/eps-plans`);
    expect(create.request.body).toEqual({ epsId: 2, regimeId: 1, code: 'A-CONTRIB', name: 'Plan A' });
    create.flush({});
    api.updateEps(2, { active: false }).subscribe();
    const toggle = http.expectOne(`${base}/admin/eps/2`);
    expect(toggle.request.method).toBe('PATCH');
    expect(toggle.request.body).toEqual({ active: false });
    toggle.flush({});
  });
});
