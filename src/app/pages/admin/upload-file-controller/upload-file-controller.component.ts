import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { UPLOAD_GENERIC_ERROR_MESSAGE } from '../../../services/upload/upload.constants';
import {
  UploadFileType,
  UploadResult,
  UploadStatus,
} from '../../../services/upload/upload.models';
import { UploadService } from '../../../services/upload/upload.service';
import {
  DEFAULT_UPLOAD_FILE_TYPES,
  formatFileSize,
  getAcceptedMimeTypes,
  getFileExtension,
  getAllowedFormatsLabel,
  getSizeLimitLabel,
  resolveAllowedTypes,
  resolveUploadFileType,
} from '../../../services/upload/upload.utils';
import { SharedModule } from '../../../shared/sharedModule';

/**
 * Reusable admin upload widget for images and videos.
 *
 * Talks exclusively to `UploadService` (the provider-agnostic facade), so it
 * keeps working unchanged when Cloudinary is swapped for Cloudflare R2.
 */
@Component({
  selector: 'app-upload-file-controller',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './upload-file-controller.component.html',
  styleUrl: './upload-file-controller.component.scss',
})
export class UploadFileControllerComponent implements OnDestroy {
  private readonly uploadService = inject(UploadService);

  private uploadSub: Subscription | null = null;
  private previewObjectUrl: string | null = null;

  /* config surfaced to the template */
  readonly providerName = this.uploadService.providerName;

  /** Hide the built-in page header when the widget is embedded in a form. */
  @Input() showHeader = true;

  /** Media kinds this instance accepts, e.g. ['video'] for video-only fields. */
  private readonly allowedTypesSignal = signal<UploadFileType[]>(
    DEFAULT_UPLOAD_FILE_TYPES,
  );

  @Input()
  set allowedTypes(types: UploadFileType[] | null | undefined) {
    this.allowedTypesSignal.set(resolveAllowedTypes(types));
  }

  get allowedTypes(): UploadFileType[] {
    return this.allowedTypesSignal();
  }

  /** Emits the result on success, and null whenever the widget is reset. */
  @Output() uploaded = new EventEmitter<UploadResult | null>();

  acceptAttribute = computed<string>(() =>
    getAcceptedMimeTypes(this.allowedTypesSignal()),
  );

  formatsLabel = computed<string>(() =>
    getAllowedFormatsLabel(this.allowedTypesSignal()),
  );

  sizeLimitLabel = computed<string>(() =>
    getSizeLimitLabel(this.allowedTypesSignal()),
  );

  /** Optional heading override (e.g. `heading="Video file"`); falls back to a
      title derived from `allowedTypes`. */
  private readonly headingSignal = signal<string>('');

  @Input()
  set heading(value: string | null | undefined) {
    this.headingSignal.set(value?.trim() ?? '');
  }

  get heading(): string {
    return this.headingSignal();
  }

  headerTitle = computed<string>(() => {
    const override = this.headingSignal();
    if (override) return override;

    const types = this.allowedTypesSignal();
    if (types.length > 1) return 'Upload File';
    return types[0] === 'video' ? 'Upload Video' : 'Upload Image';
  });

  headerSubtitle = computed<string>(() => {
    const types = this.allowedTypesSignal();
    const kinds =
      types.length > 1
        ? 'images and videos'
        : types[0] === 'video'
          ? 'a video'
          : 'an image';

    return `Upload ${kinds} — stored via ${this.providerName}.`;
  });

  /* state */
  selectedFile = signal<File | null>(null);
  fileType = signal<UploadFileType | null>(null);
  previewUrl = signal<string | null>(null);
  status = signal<UploadStatus>('idle');
  progress = signal<number>(0);
  errorMsg = signal<string | null>(null);
  result = signal<UploadResult | null>(null);
  isDragging = signal<boolean>(false);
  copied = signal<boolean>(false);

  /** Non-null alias of the preview URL so the template can bind directly. */
  previewSrc = computed<string>(() => this.previewUrl() ?? '');

  fileExtension = computed<string>(() => {
    const file = this.selectedFile();
    return file ? getFileExtension(file.name) : '';
  });

  fileSizeLabel = computed<string>(() => {
    const file = this.selectedFile();
    return file ? formatFileSize(file.size) : '';
  });

  fileTypeLabel = computed<string>(() => {
    switch (this.fileType()) {
      case 'video':
        return 'Video';
      case 'image':
        return 'Image';
      default:
        return '—';
    }
  });

  canUpload = computed<boolean>(
    () => !!this.selectedFile() && this.status() !== 'uploading',
  );

  /* ── file selection ──────────────────────────────── */

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    // allow re-selecting the same file again after a reset
    input.value = '';

    if (file) {
      this.selectFile(file);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.selectFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (this.status() !== 'uploading') {
      this.isDragging.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  /** Validates a picked/dropped file and prepares its local preview. */
  selectFile(file: File): void {
    this.cancelUpload();
    this.resetState();

    const validationError = this.uploadService.validate(
      file,
      this.allowedTypesSignal(),
    );
    if (validationError) {
      this.errorMsg.set(validationError);
      this.status.set('error');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    this.previewObjectUrl = objectUrl;
    this.selectedFile.set(file);
    this.fileType.set(resolveUploadFileType(file));
    this.previewUrl.set(objectUrl);
  }

  /* ── upload ──────────────────────────────────────── */

  upload(): void {
    const file = this.selectedFile();
    if (!file || this.status() === 'uploading') return;

    this.cancelUpload();
    this.status.set('uploading');
    this.progress.set(0);
    this.errorMsg.set(null);
    this.copied.set(false);

    this.uploadSub = this.uploadService
      .upload(file, this.allowedTypesSignal())
      .subscribe({
        next: (event) => {
          if (event.type === 'progress') {
            this.progress.set(event.percent);
            return;
          }

          this.progress.set(100);
          this.result.set(event.result);
          this.status.set('success');
          this.uploaded.emit(event.result);
        },
        error: (error: unknown) => {
          this.errorMsg.set(
            error instanceof Error && error.message
              ? error.message
              : UPLOAD_GENERIC_ERROR_MESSAGE,
          );
          this.status.set('error');
        },
      });
  }

  /** Clears file, preview, progress and result so a new file can be picked. */
  remove(): void {
    this.cancelUpload();
    this.resetState();
    this.uploaded.emit(null);
  }

  copyUrl(): void {
    const url = this.result()?.url;
    if (!url || !navigator.clipboard) return;

    navigator.clipboard.writeText(url).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    });
  }

  ngOnDestroy(): void {
    this.cancelUpload();
    this.clearPreview();
  }

  /* ── internals ───────────────────────────────────── */

  private resetState(): void {
    this.clearPreview();
    this.selectedFile.set(null);
    this.fileType.set(null);
    this.previewUrl.set(null);
    this.status.set('idle');
    this.progress.set(0);
    this.errorMsg.set(null);
    this.result.set(null);
    this.copied.set(false);
    this.isDragging.set(false);
  }

  private cancelUpload(): void {
    this.uploadSub?.unsubscribe();
    this.uploadSub = null;
  }

  private clearPreview(): void {
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }
  }
}
