import { TestBed } from '@angular/core/testing';

import { ReelGenreService } from './reel-genre.service';

describe('ReelGenreService', () => {
  let service: ReelGenreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReelGenreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
