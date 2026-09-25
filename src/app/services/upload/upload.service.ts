import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { UploadEvent, UploadFileType } from './upload.models';
import { UPLOAD_PROVIDER } from './upload-provider';
import { validateUploadFile } from './upload.utils';

/**
 * Single entry point the UI talks to for file uploads.
 *
 *   Upload component → UploadService (this) → UploadProvider → Cloudinary / R2
 *
 * The concrete provider is injected through `UPLOAD_PROVIDER`, so components
 * stay provider-independent and swapping backends never touches UI code.
 */
@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly provider = inject(UPLOAD_PROVIDER);

  /** Name of the storage backend that is currently wired up. */
  get providerName(): string {
    return this.provider.name;
  }

  /**
   * Synchronous pre-flight check so the UI can react before an upload starts.
   * `allowedTypes` optionally narrows the accepted media kinds.
   * Returns an error message, or null when the file is valid.
   */
  validate(
    file: File,
    allowedTypes?: UploadFileType[],
  ): string | null {
    return validateUploadFile(file, allowedTypes);
  }

  /**
   * Uploads a file through the active provider.
   * Invalid files never reach the provider — the same validation used by the
   * UI is re-checked here so other callers get the guarantee for free.
   */
  upload(
    file: File,
    allowedTypes?: UploadFileType[],
  ): Observable<UploadEvent> {
    const validationError = validateUploadFile(file, allowedTypes);

    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    return this.provider.upload(file);
  }
}
