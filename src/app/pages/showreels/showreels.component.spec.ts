import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowreelComponent } from './showreels.component';

describe('ShowreelComponent', () => {
  let component: ShowreelComponent;
  let fixture: ComponentFixture<ShowreelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowreelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowreelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
