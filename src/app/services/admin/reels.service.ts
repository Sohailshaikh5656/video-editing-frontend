import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as RadiusConstants from '../../RadiusUtils/RadiusConstants';
@Injectable({
  providedIn: 'root',
})
export class ReelsService {
  private readonly backendUrl = `${RadiusConstants.COMMON_BASE_URL}/v1/admin/reels`;
  constructor(private http: HttpClient) {}

  createReels(payload: any) {
    return this.http.post(`${this.backendUrl}`, payload);
  }

  
  getReels(id?: number) {
    return this.http.get(`${this.backendUrl}${id ? '/' + id : ''}`);
  }
  searchReels(search?: string) {
    return this.http.get(
      `${this.backendUrl}${search?.trim() ? '/search/' + search.trim() : ''}`,
    );
  }
  
  updateReels(id:number, payload:any){
    return this.http.put(`${this.backendUrl}/${id}`, payload);
  }
  deleteReels(id: number) {
    return this.http.delete(`${this.backendUrl}/${id }`);
  }
}
