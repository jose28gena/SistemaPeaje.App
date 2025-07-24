import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  template: `
    <div class="admin-layout">
      <h1>Admin Layout</h1>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .admin-layout {
      min-height: 100vh;
      padding: 1rem;
    }
  `]
})
export class AdminLayoutComponent {
  constructor() {}
}
