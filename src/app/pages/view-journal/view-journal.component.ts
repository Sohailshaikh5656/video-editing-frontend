import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { UserControllerService } from '../../services/user-controller.service';
import { toParagraphs, truncate } from '../../shared/text.utils';

interface ApiJournal {
  id: number;
  category_id: number;
  time: number;
  time_type: string;
  title: string;
  description: string;
  image_url: string;
  text: string;
  is_active: number;
  is_deleted: number;
  created_at: string;
}

interface JournalStory {
  id: number;
  title: string;
  category: string;
  readLabel: string;
  date: string;
  image: string;
  lead: string;
  paragraphs: string[];
}

interface RelatedPost {
  id: number;
  title: string;
  category: string;
  summary: string;
  date: string;
}

const formatRead = (time: number, type: string) =>
  time ? `${time} ${(type || 'min').toLowerCase()} read` : '';

const formatDate = (iso: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

/** Full, untruncated view of a single journal story (`/journal/:id`). */
@Component({
  selector: 'app-view-journal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './view-journal.component.html',
  styleUrl: './view-journal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewJournalComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userController = inject(UserControllerService);
  private destroyRef = inject(DestroyRef);

  readonly status = signal<'loading' | 'ready' | 'missing' | 'error'>('loading');
  readonly story = signal<JournalStory | null>(null);
  readonly related = signal<RelatedPost[]>([]);
  readonly hasImage = computed(() => !!this.story()?.image);

  ngOnInit(): void {
    // paramMap re-emits when navigating story -> story, so the component is reused safely
    this.route.paramMap
      .pipe(
        tap(() => this.status.set('loading')),
        switchMap((params) =>
          forkJoin({
            journals: this.userController.getJournal(),
            categories: this.userController.getJournalCategory().pipe(catchError(() => of(null))),
          }).pipe(
            map((res) => ({ id: params.get('id'), res: res as any })),
            catchError(() => of({ id: params.get('id'), res: null })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ id, res }) => {
        if (!res) {
          this.story.set(null);
          this.status.set('error');
          return;
        }

        const categories = new Map<number, string>(
          (res.categories?.data ?? []).map((c: { id: number; name: string }) => [c.id, c.name]),
        );
        const live: ApiJournal[] = (res.journals?.data ?? []).filter(
          (j: ApiJournal) => j.is_active === 1 && j.is_deleted === 0,
        );
        const found = live.find((j) => String(j.id) === id);

        if (!found) {
          this.story.set(null);
          this.status.set('missing');
          return;
        }

        const hasFullText = !!found.text?.trim();
        this.story.set({
          id: found.id,
          title: found.title,
          category: categories.get(found.category_id) || 'Journal',
          readLabel: formatRead(found.time, found.time_type),
          date: formatDate(found.created_at),
          image: found.image_url,
          // the short description is the standfirst; fall back to it as the body if there is no full text
          lead: hasFullText ? found.description : '',
          paragraphs: toParagraphs(hasFullText ? found.text : found.description),
        });

        this.related.set(
          live
            .filter((j) => j.id !== found.id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
            .map((j) => ({
              id: j.id,
              title: j.title,
              category: categories.get(j.category_id) || 'Journal',
              summary: truncate(j.description, 100),
              date: formatDate(j.created_at),
            })),
        );
        this.status.set('ready');
      });
  }
}
