import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as RadiusConstants from '../RadiusUtils/RadiusConstants';

/** Matches the backend's Joi `inquiryValidation` schema field-for-field. */
export interface InquiryPayload {
  full_name: string;
  email: string;
  company: string;
  timezone: string;
  project_type: string;
  brief: string;
  budget: string;
  target_date: string;
  footage_url: string;
  booking_time: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserContactService {
  private readonly backendUrl = `${RadiusConstants.COMMON_BASE_URL}/v1/user`;
  constructor(private http: HttpClient) {}

  /**
   * The backend route is currently `app.get('/v1/user/createInquiry', userInstance.createContact)`
   * — a GET used to create a resource. That cannot work from a browser: `fetch()`
   * throws `TypeError: Request with GET/HEAD method cannot have body`, and
   * confirmed live against this backend, a GET with a JSON body arrives with
   * `req.body` as `undefined` (the body never reaches the server).
   *
   * This calls POST instead, since that's the only way a body-carrying request
   * like this can work from a browser. The backend route needs to change from
   * `app.get('/v1/user/createInquiry', ...)` to `app.post('/v1/user/createInquiry', ...)`
   * to match — right now the same path 404s on POST ("Cannot POST").
   */
  createInquiry(payload: InquiryPayload): Observable<any> {
    return this.http.post(`${this.backendUrl}/createInquiry`, payload);
  }
}
