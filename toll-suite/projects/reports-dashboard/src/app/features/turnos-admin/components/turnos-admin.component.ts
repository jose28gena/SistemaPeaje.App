import { Component } from '@angular/core';

@Component({
  selector: 'op-turnos-admin',
  template: `
    <div class="turnos-admin-container">
      <nav class="turnos-nav">
        <h2>Administración de Turnos</h2>
        <ul class="nav-links">
          <li><a routerLink="dashboard" routerLinkActive="active">Dashboard</a></li>
          <li><a routerLink="templates" routerLinkActive="active">Plantillas</a></li>
          <li><a routerLink="asignaciones" routerLinkActive="active">Asignaciones</a></li>
          <li><a routerLink="eventos" routerLinkActive="active">Eventos</a></li>
        </ul>
      </nav>
      <main class="turnos-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .turnos-admin-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .turnos-nav {
      background: #2c3e50;
      color: white;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .turnos-nav h2 {
      margin: 0 0 1rem 0;
      color: #ecf0f1;
    }

    .nav-links {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      gap: 2rem;
    }

    .nav-links a {
      color: #bdc3c7;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .nav-links a:hover {
      background: #34495e;
      color: #ecf0f1;
    }

    .nav-links a.active {
      background: #3498db;
      color: white;
    }

    .turnos-content {
      flex: 1;
      padding: 2rem;
      background: #f8f9fa;
      overflow-y: auto;
    }
  `]
})
export class TurnosAdminComponent { }
