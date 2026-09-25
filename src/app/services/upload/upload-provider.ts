import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { UploadEvent } from './upload.models';

/**
 * Contract every storage backend has to fulfil.
 *
 * The UI only talks to `UploadService`, never to a concrete provider, so a
 * migration (Cloudinary → Cloudflare R2 → S3, …) means writing one new class
 * that implements this interface and swapping it in `app.config.ts`.
 */
export interface UploadProvider {
  /** Unique provider name, surfaced to the UI and stored on `UploadResult`. */
  readonly name: string;

  /** Uploads one file, reporting progress events and the final result. */
  upload(file: File): Observable<UploadEvent>;
}

/**
 * DI token that binds the active provider.
 *
 * `app.config.ts` currently binds it to `CloudinaryService`; switching to
 * Cloudflare R2 later is a single `providers` entry change.
 */
export const UPLOAD_PROVIDER = new InjectionToken<UploadProvider>(
  'UPLOAD_PROVIDER',
);
