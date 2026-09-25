import {
  HttpContext,
  HttpErrorResponse,
  HttpEventType,
  HttpProgressEvent,
  HttpRequest,
  HttpResponse,
  HttpClient,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, filter, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_AUTH_HEADERS } from '../../core/interceptors/auth.interceptor';
import { UPLOAD_GENERIC_ERROR_MESSAGE } from './upload.constants';
import {
  UploadEvent,
  UploadFileType,
  UploadResult,
} from './upload.models';
import { UploadProvider } from './upload-provider';
import {
  getFileExtension,
  resolveUploadFileType,
} from './upload.utils';

/** Subset of Cloudinary's upload response that this app relies on. */
interface CloudinaryUploadResponse {
  public_id?: string;
  url?: string;
  secure_url?: string;
  format?: string;
  bytes?: number;
  resource_type?: string;
  width?: number;
  height?: number;
  duration?: number;
  created_at?: string;
}

type CloudinaryHttpEvent =
  | HttpProgressEvent
  | HttpResponse<CloudinaryUploadResponse>;

/**
 * Cloudinary implementation of the `UploadProvider` contract.
 *
 * Uses Cloudinary's **unsigned upload** flow, which only needs the public
 * cloud name + an unsigned upload preset (both configured in
 * `environment` / `assets/env.js`). The API key and API secret are never
 * shipped to the browser:
 *
 *  - api key + secret belong on a backend and are only required for *signed*
 *    uploads / Admin API calls;
 *  - if signed uploads are ever needed, a backend signature endpoint can be
 *    fetched here and appended to the FormData next to `upload_preset`.
 *
 * Swapping to Cloudflare R2 later = new class implementing `UploadProvider`
 * + one line in `app.config.ts`. Nothing else changes.
 */
@Injectable({
  providedIn: 'root',
})
export class CloudinaryService implements UploadProvider {
  readonly name = 'cloudinary';

  private readonly http = inject(HttpClient);

  upload(file: File): Observable<UploadEvent> {
    const cloudName = environment.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = environment.CLOUDINARY_UPLOAD_PRESET;
    const resourceType = resolveUploadFileType(file);

    if (!cloudName || !uploadPreset) {
      return throwError(
        () =>
          new Error(
            'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET.',
          ),
      );
    }

    if (!resourceType) {
      return throwError(() => new Error('Unsupported file type.'));
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const request = new HttpRequest(
      'POST',
      this.buildUploadUrl(cloudName, resourceType),
      formData,
      {
        reportProgress: true,
        // Third-party endpoint: keep our internal auth headers out of it.
        context: new HttpContext().set(SKIP_AUTH_HEADERS, true),
      },
    );

    return this.http.request<CloudinaryUploadResponse>(request).pipe(
      filter(
        (event): event is CloudinaryHttpEvent =>
          event.type === HttpEventType.UploadProgress ||
          event.type === HttpEventType.Response,
      ),
      map((event) => this.toUploadEvent(event, file)),
      catchError((error: unknown) =>
        throwError(() => new Error(this.toErrorMessage(error))),
      ),
    );
  }

  /** Cloudinary upload endpoint: /v1_1/<cloud_name>/<resource_type>/upload */
  private buildUploadUrl(
    cloudName: string,
    resourceType: UploadFileType,
  ): string {
    return `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  }

  private toUploadEvent(event: CloudinaryHttpEvent, file: File): UploadEvent {
    if (event.type === HttpEventType.UploadProgress) {
      const total = event.total ?? 0;
      return {
        type: 'progress',
        percent: total > 0 ? Math.round((event.loaded / total) * 100) : 0,
        loaded: event.loaded,
        total,
      };
    }

    const body = (event as HttpResponse<CloudinaryUploadResponse>).body;

    if (!body) {
      throw new Error('Cloudinary returned an empty response.');
    }

    return { type: 'completed', result: this.toUploadResult(body, file) };
  }

  /** Maps the Cloudinary payload into our provider-agnostic `UploadResult`. */
  private toUploadResult(
    response: CloudinaryUploadResponse,
    file: File,
  ): UploadResult {
    const url = response.secure_url ?? response.url ?? '';
    const type: UploadFileType =
      response.resource_type === 'video' ? 'video' : 'image';

    return {
      url,
      fileName: file.name,
      extension: (
        response.format ?? getFileExtension(file.name)
      ).toLowerCase(),
      size: response.bytes ?? file.size,
      mimeType: file.type,
      type,
      thumbnailUrl: type === 'video' ? this.buildVideoThumbnailUrl(url) : url,
      provider: this.name,
      publicId: response.public_id ?? null,
      width: response.width ?? null,
      height: response.height ?? null,
      duration: response.duration ?? null,
      createdAt: response.created_at ?? null,
    };
  }

  /**
   * Cloudinary serves a frame as an image when the extension is swapped,
   * which gives videos a poster/thumbnail URL for free.
   */
  private buildVideoThumbnailUrl(url: string): string | null {
    if (!url) return null;

    const thumbnail = url.replace(/\.[^./]+$/, '.jpg');
    return thumbnail === url ? `${url}.jpg` : thumbnail;
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as { error?: { message?: string } } | null;
      const message = apiError?.error?.message;

      return typeof message === 'string' && message
        ? message
        : UPLOAD_GENERIC_ERROR_MESSAGE;
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return UPLOAD_GENERIC_ERROR_MESSAGE;
  }
}
