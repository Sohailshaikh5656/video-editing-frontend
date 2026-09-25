import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';

import { UploadEvent, UploadResult } from '../../../services/upload/upload.models';
import {
  UPLOAD_PROVIDER,
  UploadProvider,
} from '../../../services/upload/upload-provider';
import { UploadFileControllerComponent } from './upload-file-controller.component';

const RESULT: UploadResult = {
  url: 'https://res.cloudinary.com/root/image/upload/v1/photo.png',
  fileName: 'photo.png',
  extension: 'png',
  size: 5,
  mimeType: 'image/png',
  type: 'image',
  thumbnailUrl:
    'https://res.cloudinary.com/root/image/upload/v1/photo.png',
  provider: 'stub',
  publicId: 'photo',
  width: 800,
  height: 600,
  duration: null,
  createdAt: null,
};

class StubUploadProvider implements UploadProvider {
  readonly name = 'stub';
  readonly events = new Subject<UploadEvent>();
  uploadedFiles: File[] = [];

  upload(file: File): Observable<UploadEvent> {
    this.uploadedFiles.push(file);
    return this.events.asObservable();
  }
}

describe('UploadFileControllerComponent', () => {
  let component: UploadFileControllerComponent;
  let fixture: ComponentFixture<UploadFileControllerComponent>;
  let provider: StubUploadProvider;

  const imageFile = () =>
    new File(['bytes'], 'photo.png', { type: 'image/png' });

  beforeEach(async () => {
    provider = new StubUploadProvider();

    await TestBed.configureTestingModule({
      imports: [UploadFileControllerComponent],
      providers: [{ provide: UPLOAD_PROVIDER, useValue: provider }],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadFileControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.providerName).toBe('stub');
  });

  it('should reject unsupported files and show an error', () => {
    component.selectFile(
      new File(['x'], 'notes.txt', { type: 'text/plain' }),
    );

    expect(component.selectedFile()).toBeNull();
    expect(component.status()).toBe('error');
    expect(component.errorMsg()).toContain('Unsupported file type');
  });

  it('should preview a valid file and expose its metadata', () => {
    component.selectFile(imageFile());

    expect(component.selectedFile()?.name).toBe('photo.png');
    expect(component.fileExtension()).toBe('png');
    expect(component.fileTypeLabel()).toBe('Image');
    expect(component.fileSizeLabel()).toBe('5 B');
    expect(component.previewSrc()).toContain('blob:');
    expect(component.status()).toBe('idle');
  });

  it('should reject files outside the allowed media kinds', () => {
    component.allowedTypes = ['video'];

    component.selectFile(imageFile());

    expect(component.selectedFile()).toBeNull();
    expect(component.status()).toBe('error');
    expect(component.errorMsg()).toContain('Unsupported file type');
    expect(component.acceptAttribute()).toContain('video/mp4');
    expect(component.acceptAttribute()).not.toContain('image/png');
    expect(component.formatsLabel()).toBe('videos (MP4, WEBM, MOV, AVI)');
    expect(component.sizeLimitLabel()).toBe('Videos up to 100 MB.');
  });

  it('should derive the header title from the allowed kinds', () => {
    component.allowedTypes = ['video'];
    expect(component.headerTitle()).toBe('Upload Video');

    component.allowedTypes = ['image'];
    expect(component.headerTitle()).toBe('Upload Image');

    component.allowedTypes = ['image', 'video'];
    expect(component.headerTitle()).toBe('Upload File');
  });

  it('should emit the result on success and null when removed', () => {
    const emissions: (UploadResult | null)[] = [];
    component.uploaded.subscribe((value) => emissions.push(value));

    component.selectFile(imageFile());
    component.upload();
    provider.events.next({ type: 'completed', result: RESULT });
    component.remove();

    expect(emissions).toEqual([RESULT, null]);
  });

  it('should report progress and expose the result after a successful upload', () => {
    const file = imageFile();
    component.selectFile(file);
    component.upload();

    expect(component.status()).toBe('uploading');
    expect(provider.uploadedFiles).toEqual([file]);

    provider.events.next({
      type: 'progress',
      percent: 42,
      loaded: 42,
      total: 100,
    });
    expect(component.progress()).toBe(42);

    provider.events.next({ type: 'completed', result: RESULT });
    expect(component.status()).toBe('success');
    expect(component.progress()).toBe(100);
    expect(component.result()).toEqual(RESULT);
  });

  it('should show the provider error message when the upload fails', () => {
    component.selectFile(imageFile());
    component.upload();

    provider.events.error(new Error('Unknown upload preset'));

    expect(component.status()).toBe('error');
    expect(component.errorMsg()).toBe('Unknown upload preset');
  });

  it('should reset everything on remove', () => {
    component.selectFile(imageFile());
    component.upload();
    provider.events.next({ type: 'completed', result: RESULT });
    fixture.detectChanges();

    component.remove();

    expect(component.selectedFile()).toBeNull();
    expect(component.previewSrc()).toBe('');
    expect(component.fileType()).toBeNull();
    expect(component.result()).toBeNull();
    expect(component.progress()).toBe(0);
    expect(component.status()).toBe('idle');
    expect(component.errorMsg()).toBeNull();
  });
});
