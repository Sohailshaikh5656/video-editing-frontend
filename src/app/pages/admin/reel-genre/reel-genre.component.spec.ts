import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReelGenreComponent } from './reel-genre.component';

describe('ReelGenreComponent', () => {
  let component: ReelGenreComponent;
  let fixture: ComponentFixture<ReelGenreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReelGenreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReelGenreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
