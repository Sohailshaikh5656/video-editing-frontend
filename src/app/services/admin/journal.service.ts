import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as RadiusConstants from '../../RadiusUtils/RadiusConstants';
@Injectable({
  providedIn: 'root'
})
export class JournalService {

  private readonly backendUrl= `${RadiusConstants.COMMON_BASE_URL}/v1/admin/journal`
    constructor(private http:HttpClient) { 
    }
  
    createJournal(payload:any){
      return this.http.post(`${this.backendUrl}`, payload)
    }
    
    getJournal(id?:number){
      return this.http.get(`${this.backendUrl}${id?'/'+id:""}`,)
    }
  
    searchJournal(search:string){
      return this.http.get(`${this.backendUrl}${search.trim()?`/search/${search.trim()}`:""}`)
    }
  
    updateJournal(id:number,payload:any){
      return this.http.put(`${this.backendUrl}/${id}`, payload)
    }
    deleteJournal(id:number){
      return this.http.delete(`${this.backendUrl}/${id}`)
    }
}
