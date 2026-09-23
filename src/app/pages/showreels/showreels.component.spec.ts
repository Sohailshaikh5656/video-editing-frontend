import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowreelsComponent } from './showreels.component';

describe('ShowreelsComponent', () => {
  let component: ShowreelsComponent;
  let fixture: ComponentFixture<ShowreelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowreelsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowreelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
