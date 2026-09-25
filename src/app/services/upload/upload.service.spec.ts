import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';

import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
} from './upload.constants';
import { UploadEvent, UploadResult } from './upload.models';
import { UPLOAD_PROVIDER, UploadProvider } from './upload-provider';
import { UploadService } from './upload.service';

const FAKE_RESULT: UploadResult = {
  url: 'https://cdn.test/photo.png',
  fileName: 'photo.png',
  extension: 'png',
  size: 5,
  mimeType: 'image/png',
  type: 'image',
  thumbnailUrl: 'https://cdn.test/photo.png',
  provider: 'fake',
  publicId: 'photo',
  width: null,
  height: null,
  duration: null,
  createdAt: null,
};

class FakeProvider implements UploadProvider {
  readonly name = 'fake';
  uploadedFiles: File[] = [];

  upload(file: File): Observable<UploadEvent> {
    this.uploadedFiles.push(file);
    return of({ type: 'completed', result: FAKE_RESULT });
  }
}

describe('UploadService', () => {
  let service: UploadService;
  let provider: FakeProvider;

  const imageFile = (size = 5) =>
    new File([new Uint8Array(size)], 'photo.png', { type: 'image/png' });

  beforeEach(() => {
    provider = new FakeProvider();
    TestBed.configureTestingModule({
      providers: [{ provide: UPLOAD_PROVIDER, useValue: provider }],
    });
    service = TestBed.inject(UploadService);
  });

  it('should be created and expose the active provider name', () => {
    expect(service).toBeTruthy();
    expect(service.providerName).toBe('fake');
  });

  it('should accept valid image and video files', () => {
    expect(service.validate(imageFile())).toBeNull();
    expect(
      service.validate(
        new File([new Uint8Array(5)], 'clip.mp4', { type: 'video/mp4' }),
      ),
    ).toBeNull();
  });

  it('should reject unsupported file types', () => {
    const error = service.validate(
      new File([new Uint8Array(5)], 'notes.txt', { type: 'text/plain' }),
    );

    expect(error).toContain('Unsupported file type');
  });

  it('should honour an allowedTypes restriction', () => {
    expect(service.validate(imageFile(), ['video'])).toContain(
      'Unsupported file type',
    );

    expect(
      service.validate(
        new File([new Uint8Array(5)], 'clip.mp4', { type: 'video/mp4' }),
        ['video'],
      ),
    ).toBeNull();
  });

  it('should reject files above the size limit', () => {
    const error = service.validate(imageFile(MAX_IMAGE_SIZE_BYTES + 1));

    expect(error).toContain('maximum image size');

    const videoError = service.validate(
      new File([new Uint8Array(MAX_VIDEO_SIZE_BYTES + 1)], 'clip.mp4', {
        type: 'video/mp4',
      }),
    );

    expect(videoError).toContain('maximum video size');
  });

  it('should delegate valid uploads to the active provider', () => {
    const file = imageFile();
    const results: UploadResult[] = [];

    service.upload(file).subscribe((event) => {
      if (event.type === 'completed') results.push(event.result);
    });

    expect(provider.uploadedFiles).toEqual([file]);
    expect(results[0]).toEqual(FAKE_RESULT);
  });

  it('should not call the provider for invalid files', () => {
    let errorMessage = '';

    service
      .upload(new File([new Uint8Array(5)], 'notes.txt', { type: 'text/plain' }))
      .subscribe({ error: (error: Error) => (errorMessage = error.message) });

    expect(errorMessage).toContain('Unsupported file type');
    expect(provider.uploadedFiles.length).toBe(0);
  });
});
