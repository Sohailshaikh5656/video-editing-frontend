import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as RadiusConstants from '../../RadiusUtils/RadiusConstants';
@Injectable({
  providedIn: 'root'
})
export class ReelGenreService {
  private readonly backendUrl = `${RadiusConstants.COMMON_BASE_URL}/v1/admin/reels/category`
  
  constructor(private http:HttpClient) { 


  }

  createGenre(payload:{
    name:string
  }){
    return this.http.post(this.backendUrl, payload)
  }

  getReelsGenre(id?:number){
    return this.http.get(`${this.backendUrl}${id?`/${id}`:""}`)
  }
  
  searchGenre(search?:string){
    return this.http.get(`${this.backendUrl}${search?`/search/${search}`:""}`)
  }
  
  updateGenre(id:number, payload:{
    name:string
  }){
    return this.http.put(`${this.backendUrl}/${id}`, payload)
  }
  deleteReelsGenre(id:number){
    return this.http.delete(`${this.backendUrl}/${id}`)
  }

}
