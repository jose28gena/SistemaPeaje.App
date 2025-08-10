import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TollCardComponent } from './components/toll-card/toll-card.component';
import { LaneStatusComponent } from './components/lane-status/lane-status.component';
import { MetricDisplayComponent } from './components/metric-display/metric-display.component';
import { IncidentSemaphoreComponent } from './components/incident-semaphore/incident-semaphore.component';

@NgModule({
  declarations: [
    TollCardComponent,
    LaneStatusComponent,
  MetricDisplayComponent,
  IncidentSemaphoreComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
  MatChipsModule,
  MatTooltipModule
  ],
  exports: [
    TollCardComponent,
    LaneStatusComponent,
  MetricDisplayComponent,
  IncidentSemaphoreComponent
  ]
})
export class UiKitModule { }
