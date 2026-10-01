import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { authInterceptor } from './auth.interceptor';
import { AuthSession } from './auth-session';
import { SessionRefresher } from './session-refresher';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let session: AuthSession;
  const api = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    session = TestBed.inject(AuthSession);
    session.start(token('old-access'));
  });

  afterEach(() => backend.verify());

  it('adds the bearer token and X-Requested-With only to citas-api requests', () => {
    http.get(`${api}/appointments`).subscribe();
    http.get('https://example.org/other').subscribe();

    const own = backend.expectOne(`${api}/appointments`);
    expect(own.request.headers.get('Authorization')).toBe('Bearer old-access');
    expect(own.request.headers.get('X-Requested-With')).toBe('XMLHttpRequest');
    own.flush([]);
    const external = backend.expectOne('https://example.org/other');
    expect(external.request.headers.has('Authorization')).toBe(false);
    external.flush({});
  });

  it('sends auth calls with credentials and without the access token', () => {
    http.post(`${api}/auth/logout`, {}).subscribe();

    const logout = backend.expectOne(`${api}/auth/logout`);
    expect(logout.request.withCredentials).toBe(true);
    expect(logout.request.headers.has('Authorization')).toBe(false);
    logout.flush(null);
  });

  it('refreshes once on 401 and retries the request with the new token', () => {
    let result: unknown;
    http.get(`${api}/appointments`).subscribe(value => (result = value));

    backend.expectOne(`${api}/appointments`).flush(null, { status: 401, statusText: 'Unauthorized' });
    backend.expectOne(`${api}/auth/refresh`).flush(token('new-access'));
    const retry = backend.expectOne(`${api}/appointments`);
    expect(retry.request.headers.get('Authorization')).toBe('Bearer new-access');
    retry.flush(['ok']);

    expect(result).toEqual(['ok']);
    expect(session.accessToken()).toBe('new-access');
  });

  it('shares a single refresh between concurrent 401 responses', () => {
    http.get(`${api}/appointments`).subscribe();
    http.get(`${api}/admin/inbox`).subscribe();

    backend.expectOne(`${api}/appointments`).flush(null, { status: 401, statusText: 'Unauthorized' });
    backend.expectOne(`${api}/admin/inbox`).flush(null, { status: 401, statusText: 'Unauthorized' });
    backend.expectOne(`${api}/auth/refresh`).flush(token('new-access'));
    backend.expectOne(`${api}/appointments`).flush([]);
    backend.expectOne(`${api}/admin/inbox`).flush([]);
  });

  it('ends the session when the refresh is rejected', () => {
    let status = 0;
    http.get(`${api}/appointments`).subscribe({ error: e => (status = e.status) });

    backend.expectOne(`${api}/appointments`).flush(null, { status: 401, statusText: 'Unauthorized' });
    backend.expectOne(`${api}/auth/refresh`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(status).toBe(401);
    expect(session.accessToken()).toBeNull();
  });

  it('restores a session at startup and tolerates a missing refresh cookie', async () => {
    session.clear();
    const restored = TestBed.inject(SessionRefresher).restore();
    backend.expectOne(`${api}/auth/refresh`).flush(null, { status: 401, statusText: 'Unauthorized' });
    await restored;
    expect(session.accessToken()).toBeNull();
  });
});

function token(accessToken: string) {
  return { accessToken, tokenType: 'Bearer' as const, expiresIn: 900 };
}
