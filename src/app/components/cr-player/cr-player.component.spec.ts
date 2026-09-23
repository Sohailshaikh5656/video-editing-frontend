import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrPlayerComponent } from './cr-player.component';

describe('CrPlayerComponent', () => {
  let component: CrPlayerComponent;
  let fixture: ComponentFixture<CrPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrPlayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
