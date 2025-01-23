import { inject, Injectable } from '@angular/core';
import { fromEvent, Observable, Subject, switchMap, take, takeUntil, tap, timer } from 'rxjs';
import { ConnectionService, ConnectionState } from 'ng-connection-service';

const INTERVAL = 10000;

@Injectable({
  providedIn: 'root'
})
export class PollingService {
  private readonly connectionService: ConnectionService = inject(ConnectionService);

  private closeTimer$ = new Subject<void>();
  private lastPollingFunction!: ((arg: number) => Observable<any>);

  private isOnline = true;
  private isTabActive = true;
  private isIntervalEnded: boolean = false;

  constructor() {
    this.monitorNetworkStatus();
    this.monitorTabVisibility();
  }

  startPolling<T>(pollingFunction: (arg: number) => Observable<T>) {
    this.lastPollingFunction = pollingFunction;
    this.polling(pollingFunction);
  }

  stopPolling() {
    console.log('Stopping polling');
    this.closeTimer$.next();
  }

  private polling<T>(pollingFunction: (arg: number) => Observable<T>) {
    console.log('Starting polling');
    timer(0, INTERVAL).pipe(
      switchMap((a) => pollingFunction(a)),
      takeUntil(this.closeTimer$),
    ).subscribe({
      next: (value) => {
        console.log("Polling result:", value); // Log the result of the polling function
        if (!this.isOnline) {
          this.stopPolling();
        }
      },
      error: (error) => {
        console.error("Polling error:", error); // Handle potential errors
        this.stopPolling(); // Stop polling on error
      }
    });
  }

  private monitorNetworkStatus() {
    this.connectionService.monitor().pipe(
      tap((newState: ConnectionState) => this.isOnline = newState.hasNetworkConnection)
    ).subscribe();
  }

  private monitorTabVisibility() {
    fromEvent(document, 'visibilitychange').subscribe(() => {
      this.isTabActive = document.visibilityState === 'visible';

      if (!this.isTabActive) {
        timer(INTERVAL).pipe(
          takeUntil(fromEvent(document, 'visibilitychange')),
          take(1)
        ).subscribe(() => {
          this.stopPolling();
          this.isIntervalEnded = true;
        });
      } else if (this.isIntervalEnded) {
        this.polling(this.lastPollingFunction!);
        this.isIntervalEnded = false;
      }
    });
  }
}
