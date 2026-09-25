import { HttpEventType, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { CloudinaryService } from './cloudinary.service';
import { UploadEvent } from './upload.models';

const IMAGE_RESPONSE = {
  public_id: 'cutroom/shot',
  secure_url:
    'https://res.cloudinary.com/root/image/upload/v1/cutroom/shot.png',
  url: 'http://res.cloudinary.com/root/image/upload/v1/cutroom/shot.png',
  format: 'png',
  bytes: 11,
  resource_type: 'image',
  width: 1200,
  height: 800,
  created_at: '2026-01-01T00:00:00Z',
};

const VIDEO_RESPONSE = {
  public_id: 'cutroom/clip',
  secure_url:
    'https://res.cloudinary.com/root/video/upload/v1/cutroom/clip.mp4',
  url: 'http://res.cloudinary.com/root/video/upload/v1/cutroom/clip.mp4',
  format: 'mp4',
  bytes: 2048,
  resource_type: 'video',
  width: 1920,
  height: 1080,
  duration: 12.5,
  created_at: '2026-01-01T00:00:00Z',
};

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let httpMock: HttpTestingController;

  const imageEndpoint = () =>
    `https://api.cloudinary.com/v1_1/${environment.CLOUDINARY_CLOUD_NAME}/image/upload`;
  const videoEndpoint = () =>
    `https://api.cloudinary.com/v1_1/${environment.CLOUDINARY_CLOUD_NAME}/video/upload`;

  const imageFile = () =>
    new File(['image-bytes'], 'shot.png', { type: 'image/png' });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CloudinaryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created with the cloudinary provider name', () => {
    expect(service).toBeTruthy();
    expect(service.name).toBe('cloudinary');
  });

  it('should post the file to the Cloudinary image endpoint with progress and result', () => {
    const events: UploadEvent[] = [];
    service.upload(imageFile()).subscribe((event) => events.push(event));

    const req = httpMock.expectOne(imageEndpoint());
    expect(req.request.method).toBe('POST');

    const body = req.request.body as FormData;
    expect(body instanceof FormData).toBeTrue();
    expect(body.get('upload_preset')).toBe(
      environment.CLOUDINARY_UPLOAD_PRESET,
    );
    expect((body.get('file') as File).name).toBe('shot.png');

    req.event({
      type: HttpEventType.UploadProgress,
      loaded: 50,
      total: 100,
    } as any);
    req.flush(IMAGE_RESPONSE);

    expect(events[0]).toEqual({
      type: 'progress',
      percent: 50,
      loaded: 50,
      total: 100,
    });

    const completed = events[events.length - 1];
    expect(completed.type).toBe('completed');
    if (completed.type === 'completed') {
      expect(completed.result.url).toBe(IMAGE_RESPONSE.secure_url);
      expect(completed.result.fileName).toBe('shot.png');
      expect(completed.result.extension).toBe('png');
      expect(completed.result.size).toBe(11);
      expect(completed.result.mimeType).toBe('image/png');
      expect(completed.result.type).toBe('image');
      expect(completed.result.thumbnailUrl).toBe(
        IMAGE_RESPONSE.secure_url,
      );
      expect(completed.result.provider).toBe('cloudinary');
      expect(completed.result.publicId).toBe('cutroom/shot');
    }
  });

  it('should use the video endpoint and derive a jpg thumbnail', () => {
    const events: UploadEvent[] = [];
    service
      .upload(new File(['video-bytes'], 'clip.mp4', { type: 'video/mp4' }))
      .subscribe((event) => events.push(event));

    const req = httpMock.expectOne(videoEndpoint());
    req.flush(VIDEO_RESPONSE);

    const completed = events[events.length - 1];
    expect(completed.type).toBe('completed');
    if (completed.type === 'completed') {
      expect(completed.result.type).toBe('video');
      expect(completed.result.extension).toBe('mp4');
      expect(completed.result.size).toBe(2048);
      expect(completed.result.duration).toBe(12.5);
      expect(completed.result.thumbnailUrl).toBe(
        'https://res.cloudinary.com/root/video/upload/v1/cutroom/clip.jpg',
      );
    }
  });

  it('should surface the Cloudinary error message', () => {
    let errorMessage = '';

    service.upload(imageFile()).subscribe({
      error: (error: Error) => (errorMessage = error.message),
    });

    const req = httpMock.expectOne(imageEndpoint());
    req.flush(
      { error: { message: 'Unknown upload preset' } },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(errorMessage).toBe('Unknown upload preset');
  });

  it('should reject unsupported files without hitting the network', () => {
    let errorMessage = '';

    service
      .upload(new File(['x'], 'notes.txt', { type: 'text/plain' }))
      .subscribe({ error: (error: Error) => (errorMessage = error.message) });

    expect(errorMessage).toContain('Unsupported file type');
    httpMock.expectNone(() => true);
  });
});
