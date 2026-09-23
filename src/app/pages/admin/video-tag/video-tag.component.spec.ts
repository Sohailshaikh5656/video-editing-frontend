import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoTagComponent } from './video-tag.component';

describe('VideoTagComponent', () => {
  let component: VideoTagComponent;
  let fixture: ComponentFixture<VideoTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoTagComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VideoTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
