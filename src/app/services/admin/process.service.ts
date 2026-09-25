import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as RadiusConstants from '../../RadiusUtils/RadiusConstants';
@Injectable({
  providedIn: 'root',
})
export class ProcessService {
  private readonly backendUrl = `${RadiusConstants.COMMON_BASE_URL}/v1/admin/process`;
  constructor(private http: HttpClient) {}

  createProcess(payload: any) {
    return this.http.post(this.backendUrl, payload);
  }

  getProcess(id?: number) {
    return this.http.get(`${this.backendUrl}${id ? `/${id}` : ''}`);
  }
  searchProcess(search: string) {
    return this.http.get(
      `${this.backendUrl}${search.trim() ? `/search/${search.trim()}` : ''}`,
    );
  }

  updateProcess(id: number, payload: any) {
    return this.http.put(this.backendUrl + '/' + id, payload);
  }

  deleteProcess(id: number) {
    return this.http.delete(this.backendUrl + '/' + id);
  }
}
