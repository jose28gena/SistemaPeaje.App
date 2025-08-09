import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'op-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
      margin: 0;
      padding: 0;
    }
  `]
})
export class AppComponent {
  title = 'operator-panel';
}
