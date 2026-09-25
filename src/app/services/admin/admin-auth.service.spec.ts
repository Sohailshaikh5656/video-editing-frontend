import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AdminAuthService } from './admin-auth.service';
import * as RadiusConstants from '../../RadiusUtils/RadiusConstants';

describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminAuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.removeItem('token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('token');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST username and password and store the token', () => {
    service.login('admin', 'admin123').subscribe((res) => {
      expect(res.token).toBe('jwt-token');
    });

    const req = httpMock.expectOne(
      `${RadiusConstants.COMMON_BASE_URL}/v1/admin/login`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: 'admin',
      password: 'admin123',
    });

    req.flush({ token: 'jwt-token' });

    expect(localStorage.getItem('token')).toBe('jwt-token');
  });

  it('should not store a token when login fails', () => {
    service.login('admin', 'wrong-password').subscribe({
      error: () => {
        /* expected */
      },
    });

    const req = httpMock.expectOne(
      `${RadiusConstants.COMMON_BASE_URL}/v1/admin/login`,
    );
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(localStorage.getItem('token')).toBeNull();
  });
});
