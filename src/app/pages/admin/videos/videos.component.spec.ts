import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CloudinaryService } from '../../../services/upload/cloudinary.service';
import { UploadResult } from '../../../services/upload/upload.models';
import { UPLOAD_PROVIDER } from '../../../services/upload/upload-provider';
import { UploadFileControllerComponent } from '../upload-file-controller/upload-file-controller.component';
import { VideosComponent } from './videos.component';

const makeResult = (
  url: string,
  thumbnailUrl: string | null,
): UploadResult => ({
  url,
  fileName: 'clip.mp4',
  extension: 'mp4',
  size: 1024,
  mimeType: 'video/mp4',
  type: 'video',
  thumbnailUrl,
  provider: 'stub',
  publicId: null,
  width: null,
  height: null,
  duration: null,
  createdAt: null,
});

describe('VideosComponent', () => {
  let component: VideosComponent;
  let fixture: ComponentFixture<VideosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideosComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UPLOAD_PROVIDER, useExisting: CloudinaryService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should restrict the video uploader to videos and the optional thumbnail uploader to images', () => {
    component.openAddModal();
    fixture.detectChanges();

    let uploaders = fixture.debugElement.queryAll(
      By.directive(UploadFileControllerComponent),
    );
    expect(uploaders.length).toBe(1);
    expect(uploaders[0].componentInstance.allowedTypes).toEqual(['video']);

    component.toggleThumbnailUpload();
    fixture.detectChanges();

    uploaders = fixture.debugElement.queryAll(
      By.directive(UploadFileControllerComponent),
    );
    expect(uploaders.length).toBe(2);
    expect(uploaders[1].componentInstance.allowedTypes).toEqual(['image']);
  });

  it('should not require a thumbnail to save', () => {
    component.formTitle = 'Behind the scenes';
    component.formVideoUrl = 'https://cdn.test/clip.mp4';

    expect(component.formThumbnailUrl).toBe('');
    expect(component.canSave()).toBeTrue();
  });

  it('should keep a custom thumbnail when a video is uploaded afterwards', () => {
    component.onThumbnailUploaded(
      makeResult('https://cdn.test/custom.jpg', null),
    );

    component.onVideoUploaded(
      makeResult('https://cdn.test/clip.mp4', 'https://cdn.test/poster.jpg'),
    );

    expect(component.formVideoUrl).toBe('https://cdn.test/clip.mp4');
    expect(component.formThumbnailUrl).toBe('https://cdn.test/custom.jpg');
  });

  it('should auto-fill the thumbnail from the video upload when none was chosen', () => {
    component.onVideoUploaded(
      makeResult('https://cdn.test/clip.mp4', 'https://cdn.test/poster.jpg'),
    );

    expect(component.formThumbnailUrl).toBe('https://cdn.test/poster.jpg');
  });
});
