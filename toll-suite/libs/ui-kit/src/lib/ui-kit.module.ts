import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { TollCardComponent } from './components/toll-card/toll-card.component';
import { LaneStatusComponent } from './components/lane-status/lane-status.component';
import { MetricDisplayComponent } from './components/metric-display/metric-display.component';

@NgModule({
  declarations: [
    TollCardComponent,
    LaneStatusComponent,
    MetricDisplayComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule
  ],
  exports: [
    TollCardComponent,
    LaneStatusComponent,
    MetricDisplayComponent
  ]
})
export class UiKitModule { }
