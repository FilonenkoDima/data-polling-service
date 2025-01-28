import { Injectable } from '@angular/core';
import {
  filter,
  fromEvent,
  map,
  merge,
  Observable,
  of,
  share,
  Subject,
  switchMap,
  tap,
  timer,
  withLatestFrom
} from 'rxjs';

const INTERVAL = 10000;

@Injectable({
  providedIn: 'root'
})
export class PollingService {
  private lastPollTime: number = 0;
  private readonly online$: Observable<boolean>;
  private readonly visible$: Observable<boolean>;
  private pollingSubject: Subject<void> = new Subject<void>();

  constructor() {
    this.online$ = merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false)),
      of(navigator.onLine)
    );

    this.visible$ = merge(
      fromEvent(document, 'visibilitychange').pipe(
        map(() => document.visibilityState === 'visible')
      ),
      of(document.visibilityState === 'visible')
    );
  }

  createPolling<T>(requestFn: () => Observable<T>): Observable<T> {
    const intervalTrigger$ = timer(0, INTERVAL);
    const visibilityTrigger$ = fromEvent(document, 'visibilitychange').pipe(
      filter(() => document.visibilityState === 'visible'),
      filter(() => Date.now() - this.lastPollTime > INTERVAL)
    );

    return merge(intervalTrigger$, visibilityTrigger$, this.pollingSubject).pipe(
      withLatestFrom(this.online$, this.visible$),
      tap(([_, online, visible]) => {
        if (!online) {
          console.log('Polling paused: No internet connection');
        }
        if (!visible) {
          console.log('Polling paused: Tab inactive');
        }
      }),
      filter(([_, online, visible]) => online && visible),
      tap(() => {
        if (Date.now() - this.lastPollTime > INTERVAL && this.lastPollTime !== 0) {
          console.log('Resuming polling: Tab active again');
        }
      }),
      switchMap(() => {
        this.lastPollTime = Date.now();
        console.log('Polling request sent');
        return requestFn().pipe(
          tap({
            error: (err) => console.error('Polling error:', err)
          })
        );
      }),
      share()
    );
  }

  forceImmediatePoll() {
    this.pollingSubject.next();
  }
}
