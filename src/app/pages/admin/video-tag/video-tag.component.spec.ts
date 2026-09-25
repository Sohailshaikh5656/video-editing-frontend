import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { VideoTagsComponent } from './video-tag.component';

describe('VideoTagsComponent', () => {
  let component: VideoTagsComponent;
  let fixture: ComponentFixture<VideoTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoTagsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VideoTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
