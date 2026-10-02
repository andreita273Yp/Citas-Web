import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { AgendaApi } from './agenda-api';
import { BookingApi } from './booking-api';

describe('BookingApi and AgendaApi', () => {
  let http: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('searches availability sending only the filters that were chosen', () => {
    const booking = TestBed.inject(BookingApi);
    booking.availability({ specialtyId: 2, date: '2030-01-15', locationId: null, professionalId: 7 }).subscribe();
    const request = http.expectOne(r => r.url === `${api}/availability`);
    expect(request.request.params.get('specialtyId')).toBe('2');
    expect(request.request.params.get('date')).toBe('2030-01-15');
    expect(request.request.params.has('locationId')).toBe(false);
    expect(request.request.params.get('professionalId')).toBe('7');
    request.flush([]);
  });

  it('filters specialties by appointment type and books with the selected start', () => {
    const booking = TestBed.inject(BookingApi);
    booking.specialties('SPECIALIZED').subscribe();
    http.expectOne(r => r.url === `${api}/catalogs/specialties` && r.params.get('type') === 'SPECIALIZED').flush([]);

    booking.book({ professionalId: 1, locationId: 2, specialtyId: 3, startAt: '2030-01-15T08:00' }).subscribe();
    const book = http.expectOne(`${api}/appointments`);
    expect(book.request.method).toBe('POST');
    expect(book.request.body).toEqual({ professionalId: 1, locationId: 2, specialtyId: 3, startAt: '2030-01-15T08:00' });
    book.flush({});
  });

  it('manages own blocks through the professional contract', () => {
    const agenda = TestBed.inject(AgendaApi);
    agenda.create({ locationId: 1, date: '2030-01-15', startTime: '08:00', endTime: '12:00' }).subscribe();
    const create = http.expectOne(`${api}/professional/blocks`);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual({ locationId: 1, date: '2030-01-15', startTime: '08:00', endTime: '12:00' });
    create.flush({});

    agenda.remove(9).subscribe();
    const remove = http.expectOne(`${api}/professional/blocks/9`);
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null);

    agenda.blocks({ from: '2030-01-01', locationId: 2 }).subscribe();
    const list = http.expectOne(r => r.url === `${api}/professional/blocks`);
    expect(list.request.params.get('from')).toBe('2030-01-01');
    expect(list.request.params.get('locationId')).toBe('2');
    expect(list.request.params.has('to')).toBe(false);
    list.flush([]);
  });
});
