/** Media kinds the upload stack supports. */
export type UploadFileType = 'image' | 'video';

/** Lifecycle of a single file inside the UI. */
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/**
 * Provider-agnostic metadata returned after a successful upload.
 * Every provider (Cloudinary today, Cloudflare R2 tomorrow) maps its own
 * response into this shape, so UI code never depends on a specific backend.
 */
export interface UploadResult {
  /** Public, permanent URL of the stored file. */
  url: string;
  /** Original file name, e.g. "hero-shot.mp4". */
  fileName: string;
  /** Lower-case extension without the dot, e.g. "mp4". */
  extension: string;
  /** File size in bytes. */
  size: number;
  /** Mime type reported by the browser, e.g. "video/mp4". */
  mimeType: string;
  /** Resolved media kind. */
  type: UploadFileType;
  /** Preview image (video poster frame / the image itself) when applicable. */
  thumbnailUrl: string | null;
  /** Name of the provider that stored the file, e.g. "cloudinary". */
  provider: string;
  /** Provider-side identifier (Cloudinary public_id, R2 object key, …). */
  publicId: string | null;
  width: number | null;
  height: number | null;
  /** Duration in seconds — videos only. */
  duration: number | null;
  /** ISO timestamp reported by the provider. */
  createdAt: string | null;
}

/** Emitted while bytes are being transferred. */
export interface UploadProgress {
  type: 'progress';
  /** 0–100. */
  percent: number;
  loaded: number;
  total: number;
}

/** Emitted once the provider stored the file. */
export interface UploadCompleted {
  type: 'completed';
  result: UploadResult;
}

/** Everything a provider can report for one upload. */
export type UploadEvent = UploadProgress | UploadCompleted;
