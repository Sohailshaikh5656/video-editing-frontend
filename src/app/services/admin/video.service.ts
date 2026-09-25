import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as RadiusConstants from '../../RadiusUtils/RadiusConstants';

export interface VideoPayload {
  title: string;
  name: string;
  description: string;
  vedio_url: string;
  thumbnail_url: string;
  views: number;
  tags: number[];
}

@Injectable({ providedIn: 'root' })
export class VideoService {
  private readonly backendUrl = `${RadiusConstants.COMMON_BASE_URL}/v1/admin/videos`;
  constructor(private http: HttpClient) {}

  createVideo(payload: VideoPayload) {
    return this.http.post(this.backendUrl, payload);
  }

  getVideo(id?: number) {
    return this.http.get(`${this.backendUrl}${id ? '/'+id : ''}`);
  }

  searchVideo(search: string) {
    return this.http.get(
      `${this.backendUrl}${search.trim() ? `/search/${search.trim()}` : ''}`,
    );
  }

  updateVideo(id: number, payload: any) {
    return this.http.put(`${this.backendUrl}/${id}`, payload);
  }

  deleteVideo(id: number) {
    return this.http.delete(`${this.backendUrl}/${id}`);
  }
}
