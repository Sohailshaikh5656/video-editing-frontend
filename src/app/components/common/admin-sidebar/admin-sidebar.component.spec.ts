import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AdminSidebarComponent } from './admin-sidebar.component';

describe('AdminSidebarComponent', () => {
  let component: AdminSidebarComponent;
  let fixture: ComponentFixture<AdminSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSidebarComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    
    fixture = TestBed.createComponent(AdminSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep process and testimonials outside of journal', () => {
    const journalItems = component.sections.find(
      (section) => section.heading === 'Journal',
    )?.items;
    const processItems = component.sections.find(
      (section) => section.heading === 'Process',
    )?.items;
    const testimonialItems = component.sections.find(
      (section) => section.heading === 'Testimonials',
    )?.items;

    expect(journalItems?.map((item) => item.id)).toEqual([
      'journal-category',
      'journal',
    ]);
    expect(processItems?.map((item) => item.id)).toEqual(['process']);
    expect(testimonialItems?.map((item) => item.id)).toEqual([
      'testimonials',
    ]);
  });
});
