import { TestBed } from '@angular/core/testing';

import { JournalGenreService } from './journal-genre.service';

describe('JournalGenreService', () => {
  let service: JournalGenreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JournalGenreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
