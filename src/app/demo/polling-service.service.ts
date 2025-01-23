import { Injectable } from '@angular/core';
import { Subject, takeUntil, tap, timer } from 'rxjs';

const INTERVAL = 1000;

@Injectable({
  providedIn: 'root'
})
export class PollingServiceService {

  private closeTimer$ = new Subject<number>();

  startPolling() {
    timer(0, INTERVAL).pipe(
      tap((a) => console.log('polling - ', a)),
      takeUntil(this.closeTimer$)
    ).subscribe({
      next: () => {
      }
    });
  }

  stopPolling() {
    this.closeTimer$.next(1);
  }
}
