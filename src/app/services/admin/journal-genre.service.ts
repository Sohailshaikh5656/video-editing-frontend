import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as RadiusConstants from '../../RadiusUtils/RadiusConstants';
@Injectable({
  providedIn: 'root'
})
export class JournalGenreService {
  private readonly backendUrl= `${RadiusConstants.COMMON_BASE_URL}/v1/admin/journal/category`
  constructor(private http:HttpClient) { 
  }

  createJournalGenre(payload:{
    name : string
  }){
    return this.http.post(`${this.backendUrl}`, payload)
  }
  
  getJournalGenre(id?:number){
    return this.http.get(`${this.backendUrl}${id?'/'+id:""}`,)
  }

  searchJournalGenre(search:string){
    return this.http.get(`${this.backendUrl}${search.trim()?`/search/${search.trim()}`:""}`)
  }

  updateJournalGenre(id:number,payload:{
    name : string
  }){
    return this.http.put(`${this.backendUrl}/${id}`, payload)
  }
  deleteJournalGenre(id:number){
    return this.http.delete(`${this.backendUrl}/${id}`)
  }
}
