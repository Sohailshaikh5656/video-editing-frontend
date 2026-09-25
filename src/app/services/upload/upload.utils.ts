import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_MIME_TYPES,
  ACCEPTED_VIDEO_EXTENSIONS,
  ACCEPTED_VIDEO_MIME_TYPES,
  ALLOWED_FORMATS_LABEL,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_BYTES,
  MAX_VIDEO_SIZE_MB,
} from './upload.constants';
import { UploadFileType } from './upload.models';

/** Allowance used when a caller does not restrict the media kinds. */
export const DEFAULT_UPLOAD_FILE_TYPES: UploadFileType[] = ['image', 'video'];

/** Normalises an optional restriction to a non-empty list of media kinds. */
export function resolveAllowedTypes(
  allowedTypes?: UploadFileType[] | null,
): UploadFileType[] {
  return allowedTypes?.length ? allowedTypes : DEFAULT_UPLOAD_FILE_TYPES;
}

/**
 * Human readable list of the accepted kinds,
 * e.g. "videos (MP4, WEBM, MOV, AVI)" or "images (…) and videos (…)".
 */
export function getAllowedFormatsLabel(
  allowedTypes?: UploadFileType[] | null,
): string {
  const types = resolveAllowedTypes(allowedTypes);

  if (types.length > 1) return ALLOWED_FORMATS_LABEL;

  return types[0] === 'video'
    ? 'videos (MP4, WEBM, MOV, AVI)'
    : 'images (JPG, PNG, WEBP, GIF, AVIF)';
}

/** Size-limit hint for the accepted kinds, e.g. "Videos up to 100 MB.". */
export function getSizeLimitLabel(
  allowedTypes?: UploadFileType[] | null,
): string {
  const types = resolveAllowedTypes(allowedTypes);
  const parts: string[] = [];

  if (types.includes('image')) parts.push(`images up to ${MAX_IMAGE_SIZE_MB} MB`);
  if (types.includes('video')) parts.push(`videos up to ${MAX_VIDEO_SIZE_MB} MB`);

  const label = parts.join(', ');
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}.`;
}

/** Comma separated mime list for an `<input type="file">` accept attribute. */
export function getAcceptedMimeTypes(
  allowedTypes?: UploadFileType[] | null,
): string {
  const types = resolveAllowedTypes(allowedTypes);
  const mimes: string[] = [];

  if (types.includes('image')) mimes.push(...ACCEPTED_IMAGE_MIME_TYPES);
  if (types.includes('video')) mimes.push(...ACCEPTED_VIDEO_MIME_TYPES);

  return mimes.join(',');
}

/**
 * Lower-case extension without the dot ("clip.MP4" → "mp4").
 * Returns an empty string when the name has no extension.
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? (parts.pop() as string).toLowerCase() : '';
}

/**
 * Resolves a file to "image" | "video".
 * The mime type wins; the extension is a fallback for browsers that report
 * an empty mime type (happens with some .mov files on Windows).
 */
export function resolveUploadFileType(file: File): UploadFileType | null {
  if (ACCEPTED_IMAGE_MIME_TYPES.includes(file.type)) return 'image';
  if (ACCEPTED_VIDEO_MIME_TYPES.includes(file.type)) return 'video';

  const extension = getFileExtension(file.name);
  if (ACCEPTED_IMAGE_EXTENSIONS.includes(extension)) return 'image';
  if (ACCEPTED_VIDEO_EXTENSIONS.includes(extension)) return 'video';

  return null;
}

/** Human readable file size, e.g. "4.2 MB". */
export function formatFileSize(bytes: number): string {
  if (!isFinite(bytes) || bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  const decimals = exponent === 0 || value >= 100 ? 0 : 1;

  return `${value.toFixed(decimals)} ${units[exponent]}`;
}

/**
 * Validates a file before it is uploaded and returns a user-facing error
 * message, or null when the file is allowed.
 *
 * `allowedTypes` optionally narrows the accepted media kinds (e.g. `['video']`
 * for a video-only field). Used by the UI for instant feedback and re-checked
 * by `UploadService` before the provider is called.
 */
export function validateUploadFile(
  file: File,
  allowedTypes?: UploadFileType[] | null,
): string | null {
  const type = resolveUploadFileType(file);
  const allowed = resolveAllowedTypes(allowedTypes);

  if (!type || !allowed.includes(type)) {
    const reported = file.type ? ` "${file.type}"` : '';
    return `Unsupported file type${reported}. Allowed formats: ${getAllowedFormatsLabel(allowed)}.`;
  }

  if (file.size === 0) {
    return `"${file.name}" is empty — nothing to upload.`;
  }

  const maxBytes =
    type === 'image' ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
  const maxMb = type === 'image' ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;

  if (file.size > maxBytes) {
    return `"${file.name}" is ${formatFileSize(file.size)} — the maximum ${type} size is ${maxMb} MB.`;
  }

  return null;
}
