import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { AuthApi, LoginResponse, RegisterRequest } from './auth-api';

describe('AuthApi', () => {
  let api: AuthApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(AuthApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends login through the configured API with browser credentials', () => {
    api.login('ana@example.com', 'secret').subscribe();

    const request = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'ana@example.com', password: 'secret' });
    expect(request.request.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    expect(request.request.withCredentials).toBe(true);
    request.flush(tokenResponse());
  });

  it('registers a USER through the configured API with browser credentials', () => {
    const registration: RegisterRequest = {
      firstName: 'Ana', lastName: 'Prueba', documentType: 'CC', documentNumber: '123456',
      email: 'ana@example.com', phone: '3001234567', password: 'password-segura',
    };
    api.register(registration).subscribe();

    const request = http.expectOne(`${environment.apiUrl}/auth/register`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(registration);
    expect(request.request.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    expect(request.request.withCredentials).toBe(true);
    request.flush({ id: 'user-id', ...registration, roles: ['USER'] });
  });

  it('sends refresh through the configured API with browser credentials', () => {
    api.refresh().subscribe();

    const request = http.expectOne(`${environment.apiUrl}/auth/refresh`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    expect(request.request.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    expect(request.request.withCredentials).toBe(true);
    request.flush(tokenResponse());
  });

  it('sends logout through the configured API with browser credentials', () => {
    api.logout().subscribe();

    const request = http.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    expect(request.request.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    expect(request.request.withCredentials).toBe(true);
    request.flush(null);
  });
});

function tokenResponse(): LoginResponse {
  return { accessToken: 'test-access-token', tokenType: 'Bearer', expiresIn: 900 };
}
