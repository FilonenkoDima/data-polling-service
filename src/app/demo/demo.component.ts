import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { of, Subscription } from 'rxjs';

import { PollingService } from './polling.service';

@Component({
  selector: 'app-demo',
  imports: [],
  templateUrl: './demo.component.html',
})
export class DemoComponent implements OnInit, OnDestroy {
  private pollingSubscription!: Subscription;
  private readonly pollingService: PollingService = inject(PollingService);

  ngOnInit(): void {
    this.startCustomPolling();
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  private startCustomPolling(): void {
    const polling$ = this.pollingService.createPolling<string>(
      () => of(`My custom polling`)
    );

    this.pollingSubscription = polling$.subscribe({
      next: (result) => console.log('Received:', result),
      error: (err) => console.error('Component error:', err)
    });
  }
}
