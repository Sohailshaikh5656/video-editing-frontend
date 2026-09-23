import { TestBed } from '@angular/core/testing';

import { VideoTagsService } from './video-tags.service';

describe('VideoTagsService', () => {
  let service: VideoTagsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoTagsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
