import { Component, inject, OnInit } from '@angular/core';
import { PollingServiceService } from './polling-service.service';

@Component({
  selector: 'app-demo',
  imports: [],
  templateUrl: './demo.component.html',
})
export class DemoComponent implements OnInit {
  private pollingService = inject(PollingServiceService);

  ngOnInit(): void {
  }

  startPolling() {
    this.pollingService.startPolling();
  }
  stopPolling() {
    this.pollingService.stopPolling();
  }

}
