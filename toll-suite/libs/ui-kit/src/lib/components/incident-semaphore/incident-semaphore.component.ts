import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';

export type SemaphoreState = 'green' | 'yellow' | 'red' | 'gray';

export interface SemaphoreTotals {
  ok: number; // eventos sin incidencia (verde)
  warn: number; // incidencias leves abiertas (amarillo)
  crit: number; // incidencias críticas abiertas (rojo)
  all: number; // total de eventos procesados en el turno
}

@Component({
  selector: 'ui-incident-semaphore',
  template: `
    <div class="incident-semaphore" [class.state-green]="state==='green'" [class.state-yellow]="state==='yellow'"
         [class.state-red]="state==='red'" [class.state-gray]="state==='gray'"
         (click)="openPanel.emit()"
         (contextmenu)="onSecondary($event)" (mousedown)="onPressStart($event)" (mouseup)="onPressEnd()" (mouseleave)="onPressEnd()">
      <div class="top-row">
        <div class="big-counter" [matTooltip]="tooltip(totalsTooltip)">{{ totals.all }}</div>
        <div class="lights">
          <div class="light red" [class.blink-fast]="state==='red'" [matTooltip]="tooltip(redTooltip)" (dblclick)="filter.emit('crit')">
            <span class="light-number">{{ totals.crit }}</span>
          </div>
          <div class="light yellow" [class.blink-slow]="state==='yellow'" [matTooltip]="tooltip(yellowTooltip)" (dblclick)="filter.emit('warn')">
            <span class="light-number">{{ totals.warn }}</span>
          </div>
          <div class="light green" [matTooltip]="tooltip(greenTooltip)" (dblclick)="filter.emit('ok')">
            <span class="light-number">{{ totals.ok }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .incident-semaphore {
      display: grid;
      gap: 6px;
      user-select: none;
      cursor: pointer;
    }
    .top-row { 
      display: grid; 
      grid-template-columns: 1fr auto; 
      align-items: center; 
      gap: 8px; 
    }
    .big-counter {
      background: #263238; 
      color: #fff; 
      font-weight: 800; 
      font-size: 20px;
      border-radius: 6px; 
      padding: 8px 12px; 
      min-width: 60px; 
      text-align: center; 
      border: 2px solid #000;
      font-variant-numeric: tabular-nums;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .lights { 
      display: grid; 
      grid-auto-flow: column; 
      gap: 6px; 
      align-items: center; 
    }
    .light { 
      width: 36px; 
      height: 36px; 
      border-radius: 50%; 
      border: 2px solid #000; 
      box-shadow: inset 0 0 6px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .light:hover {
      transform: scale(1.05);
      box-shadow: inset 0 0 8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3);
    }
    .light.green { 
      background: radial-gradient(circle at 30% 30%, #4caf50, #2e7d32); 
    }
    .light.yellow { 
      background: radial-gradient(circle at 30% 30%, #ffeb3b, #f9a825); 
    }
    .light.red { 
      background: radial-gradient(circle at 30% 30%, #f44336, #d32f2f); 
    }
    .light-number {
      color: #000;
      font-weight: 800;
      font-size: 12px;
      text-shadow: 0 0 2px rgba(255,255,255,0.8);
      font-variant-numeric: tabular-nums;
    }
    .light.red .light-number {
      color: #fff;
      text-shadow: 0 0 2px rgba(0,0,0,0.8);
    }
    .light.green .light-number {
      color: #fff;
      text-shadow: 0 0 2px rgba(0,0,0,0.8);
    }
    .blink-slow { animation: blink 1s step-end infinite; }
    .blink-fast { animation: blink 0.5s step-end infinite; }
    @keyframes blink { 50% { opacity: 0.3; } }
  `]
})
export class IncidentSemaphoreComponent implements OnInit, OnDestroy {
  @Input() state: SemaphoreState = 'gray';
  @Input() totals: SemaphoreTotals = { ok: 0, warn: 0, crit: 0, all: 0 };
  @Input() lastChange?: Date; // último cambio global

  // Tooltips texts
  @Input() greenTooltip = 'Eventos sin incidencia';
  @Input() yellowTooltip = 'Incidencias leves abiertas';
  @Input() redTooltip = 'Incidencias críticas abiertas';
  @Input() totalsTooltip = 'Total de eventos del turno';

  // Beep control
  @Input() beepEverySeconds = 10; // beep corto cada 10s en rojo
  @Input() silenceSecondsDefault = 900; // 15 min

  @Output() openPanel = new EventEmitter<void>();
  @Output() openHealth = new EventEmitter<void>();
  @Output() ack = new EventEmitter<number>();
  @Output() filter = new EventEmitter<'ok'|'warn'|'crit'>();

  private pressTimer: any | null = null;
  private beepTimer: any | null = null;
  private silenceUntil: number = 0;
  private audioCtx: AudioContext | null = null;

  ngOnInit(): void {
    this.setupBeepTimer();
  }

  ngOnDestroy(): void {
    if (this.beepTimer) clearInterval(this.beepTimer);
    if (this.pressTimer) clearTimeout(this.pressTimer);
    this.audioCtx?.close().catch(() => {});
  }

  // Keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key.toLowerCase() === 'f9') {
      if (e.shiftKey) { this.openHealth.emit(); }
      else if (e.ctrlKey) { this.ackAll(); }
      else { this.openPanel.emit(); }
      e.preventDefault();
    }
  }

  onSecondary(ev: MouseEvent) {
    ev.preventDefault();
    this.openHealth.emit();
  }

  onPressStart(ev: MouseEvent) {
    // Mantener 2s para ACK
    if (ev.button !== 0) return;
    this.pressTimer = setTimeout(() => this.ackAll(), 2000);
  }

  onPressEnd() {
    if (this.pressTimer) { clearTimeout(this.pressTimer); this.pressTimer = null; }
  }

  private ackAll() {
    const seconds = this.silenceSecondsDefault;
    this.silenceUntil = Date.now() + seconds * 1000;
    this.ack.emit(seconds);
  }

  private setupBeepTimer() {
    this.beepTimer = setInterval(() => {
      if (this.state !== 'red') return;
      if (Date.now() < this.silenceUntil) return; // silenciado
      this.playBeep(1000, 1100, 80); // corto
    }, this.beepEverySeconds * 1000);
  }

  private playBeep(freq = 1000, freq2 = 1200, durationMs = 100) {
    try {
      if (!this.audioCtx) this.audioCtx = new (window as any).AudioContext();
      const ctx = this.audioCtx!;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      o.start();
      // small chirp up
      o.frequency.linearRampToValueAtTime(freq2, ctx.currentTime + durationMs / 1000);
      o.stop(ctx.currentTime + durationMs / 1000);
    } catch {}
  }

  tooltip(base: string): string {
    const lc = this.lastChange ? this.lastChange : null;
    const time = lc ? new Date(lc).toLocaleTimeString('es-MX', { hour12: false }) : null;
    return time ? `${base} · últ. cambio ${time}` : base;
  }
}
