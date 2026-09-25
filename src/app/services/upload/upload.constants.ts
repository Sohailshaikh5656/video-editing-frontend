/* ───────────────── Upload validation config ─────────────────
   Single source of truth for formats + size limits, shared by the
   validation helpers, the UI hints and the <input accept> attribute.
────────────────────────────────────────────────────────────── */

/** Mime types accepted for images. */
export const ACCEPTED_IMAGE_MIME_TYPES: string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];

/** Mime types accepted for videos. */
export const ACCEPTED_VIDEO_MIME_TYPES: string[] = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
];

/** Extension fallback for browsers that report an empty mime type. */
export const ACCEPTED_IMAGE_EXTENSIONS: string[] = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'avif',
];

/** Extension fallback for browsers that report an empty mime type. */
export const ACCEPTED_VIDEO_EXTENSIONS: string[] = [
  'mp4',
  'webm',
  'mov',
  'avi',
];

/** Size limits. */
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 100;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

/** Human readable list used in hints and error messages. */
export const ALLOWED_FORMATS_LABEL =
  'images (JPG, PNG, WEBP, GIF, AVIF) and videos (MP4, WEBM, MOV, AVI)';

/** `accept` attribute value for `<input type="file">`. */
export const UPLOAD_ACCEPT_ATTRIBUTE = [
  ...ACCEPTED_IMAGE_MIME_TYPES,
  ...ACCEPTED_VIDEO_MIME_TYPES,
].join(',');

/** Fallback message when a provider fails without a usable reason. */
export const UPLOAD_GENERIC_ERROR_MESSAGE =
  'Upload failed. Please try again.';
