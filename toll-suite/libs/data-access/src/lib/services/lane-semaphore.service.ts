import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './base-api.service';

export type LaneSemaphoreState = 'green' | 'yellow' | 'red' | 'gray';

export interface LaneSemaphoreDto {
  state: LaneSemaphoreState;
  totals: { ok: number; warn: number; crit: number; all: number };
  devices?: Record<string, any>;
  backlog?: { queue: number; delayMinutes: number };
  lastChange?: string;
}

@Injectable({ providedIn: 'root' })
export class LaneSemaphoreService {
  constructor(private http: HttpClient, @Inject(API_BASE_URL) private baseUrl: string) {}

  getSemaphore(laneId: number): Observable<LaneSemaphoreDto> {
    return this.http.get<LaneSemaphoreDto>(`${this.baseUrl}/v1/lanes/${laneId}/semaphore`);
  }
}
