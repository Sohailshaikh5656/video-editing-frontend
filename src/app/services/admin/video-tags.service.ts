import { Injectable } from '@angular/core';
import * as RadiusConstants from '../../RadiusUtils/RadiusConstants';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VideoTagsService {
  backendUrl = `${RadiusConstants.COMMON_BASE_URL}/v1/admin/tags`;
  constructor(private http: HttpClient) {}

  getAllTags(search?: string) {
    return this.http.get(
      `${this.backendUrl}${search ? `/search/${search}` : ''}`,
    );
  }

  getTagsById(id: number) {
    return this.http.get(`${this.backendUrl}/${id}`);
  }

  createTags(payload: { tag: string }) {
    return this.http.post(`${this.backendUrl}`, payload);
  }

  updateTags(payload: { tag: string }) {
    return this.http.put(`${this.backendUrl}`, payload);
  }

  deleteTag(id: number) {
    return this.http.delete(`${this.backendUrl}/${id}`);
  }
}
