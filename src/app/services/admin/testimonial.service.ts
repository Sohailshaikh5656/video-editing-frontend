import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as RadiusConstants from '../../RadiusUtils/RadiusConstants';

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {

  private readonly backendUrl= `${RadiusConstants.COMMON_BASE_URL}/v1/admin/reviews`
  constructor(private http:HttpClient) { 
  }

  createTestimonial(payload:any){
    return this.http.post(`${this.backendUrl}`, payload)
  }
  
  getTestimonial(id?:number){
    return this.http.get(`${this.backendUrl}${id?'/'+id:""}`,)
  }

  searchTestimonial(search:string){
    return this.http.get(`${this.backendUrl}${search.trim()?`/search/${search.trim()}`:""}`)
  }

  updateTestimonial(id:number,payload:any){
    return this.http.put(`${this.backendUrl}/${id}`, payload)
  }
  deleteTestimonial(id:number){
    return this.http.delete(`${this.backendUrl}/${id}`)
  }
}
