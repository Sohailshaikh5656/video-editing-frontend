import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as RadiusConstants from '../../RadiusUtils/RadiusConstants';

/** One contact-form submission, matching the backend's Joi `inquiryValidation` schema. */
export interface Inquiry {
  id?: number;
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
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class InquiryService {
  private readonly backendUrl = `${RadiusConstants.COMMON_BASE_URL}/v1/admin/inquiry`;
  constructor(private http: HttpClient) {}

  getInquiry() {
    return this.http.get(this.backendUrl);
  }
}
