import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import * as RadiusConstants from '../../RadiusUtils/RadiusConstants';

export interface AdminLoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  backendUrl = `${RadiusConstants.COMMON_BASE_URL}/v1/admin/login`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http
      .post<AdminLoginResponse>(`${this.backendUrl}`, { username, password })
      .pipe(
        tap((res) => {
          if (res?.token) {
            localStorage.setItem('token', res.token);
          }
        }),
      );
  }
}
