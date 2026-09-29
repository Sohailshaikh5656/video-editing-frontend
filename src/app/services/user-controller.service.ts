import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as RadiusConstants from '../RadiusUtils/RadiusConstants';
@Injectable({
  providedIn: 'root',
})
export class UserControllerService {
  private readonly backendUrl = `${RadiusConstants.COMMON_BASE_URL}/v1/user`;
  constructor(private http: HttpClient) {}

  getTags() {
    return this.http.get(`${this.backendUrl}/tags`);
  }
  getVideos() {
    return this.http.get(`${this.backendUrl}/videos`);
  }
  getProcess() {
    return this.http.get(`${this.backendUrl}/process`);
  }
  getReviews() {
    return this.http.get(`${this.backendUrl}/reviews`);
  }
  getJournalCategory() {
    return this.http.get(`${this.backendUrl}/journal/category`);
  }
  getJournal() {
    return this.http.get(`${this.backendUrl}/journal`);
  }
  getReelsCategory() {
    return this.http.get(`${this.backendUrl}/reels/category`);
  }
  getReels() {
    return this.http.get(`${this.backendUrl}/reels`);
  }
  getBrand() {
    return this.http.get(`${this.backendUrl}/getBrand`);
  }
}
