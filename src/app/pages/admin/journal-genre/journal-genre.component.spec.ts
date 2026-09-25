import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalGenreComponent } from './journal-genre.component';

describe('JournalGenreComponent', () => {
  let component: JournalGenreComponent;
  let fixture: ComponentFixture<JournalGenreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalGenreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JournalGenreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
