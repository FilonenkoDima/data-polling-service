import { Component, inject } from '@angular/core';
import { of } from 'rxjs';

import { PollingService } from './polling.service';

@Component({
  selector: 'app-demo',
  imports: [],
  templateUrl: './demo.component.html',
})
export class DemoComponent {
  private pollingService = inject(PollingService);

  startPolling() {
    const myPollingFunction = (a: number) => {
      return of(`My custom polling - ${a * 2}`);
    };

    this.pollingService.startPolling(myPollingFunction);
  }
  stopPolling() {
    this.pollingService.stopPolling();
  }
}
