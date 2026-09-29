import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as RadiusConstants from '../../RadiusUtils/RadiusConstants';
@Injectable({
  providedIn: 'root'
})
export class BrandService {

    backendUrl = `${RadiusConstants.COMMON_BASE_URL}/v1/admin/brand`;
  
  constructor(private http : HttpClient) { }
  getAllBrand(search?: string) {
    return this.http.get(
      `${this.backendUrl}${search ? `/search/${search}` : ''}`,
    );
  }

  getBrandsById(id: number) {
    return this.http.get(`${this.backendUrl}/${id}`);
  }

  createBrand(payload: { tag: string }) {
    return this.http.post(`${this.backendUrl}`, payload);
  }

  updateBrand(id:number,payload: { tag: string }) {
    return this.http.put(`${this.backendUrl}/${id}`, payload);
  }

  deleteBrand(id: number) {
    return this.http.delete(`${this.backendUrl}/${id}`);
  }
  changeStatus(id:number, status:boolean){
    return this.http.put(`${this.backendUrl}/status/${id}`, {is_active : status})
  }
}
