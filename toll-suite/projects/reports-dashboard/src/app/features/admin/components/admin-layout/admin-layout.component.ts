import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  template: `
    <div class="admin-layout">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <h1>Sistema de Gestión de Peajes</h1>
          <div class="user-info">
            <span>Administrador</span>
            <button class="logout-btn">Salir</button>
          </div>
        </div>
      </header>

      <div class="main-container">
        <!-- Sidebar -->
        <aside class="sidebar">
          <nav class="nav-menu">
            <h2>Panel de Control</h2>
            <ul>
              <li><a routerLink="/admin/test" routerLinkActive="active">Dashboard</a></li>
              <li><a routerLink="/admin/estaciones" routerLinkActive="active">Estaciones</a></li>
              <li><a routerLink="/admin/carriles" routerLinkActive="active">Carriles</a></li>
              <li><a routerLink="/admin/empleados" routerLinkActive="active">Empleados</a></li>
              <li><a routerLink="/admin/clientes" routerLinkActive="active">Clientes</a></li>
              <li><a routerLink="/admin/tarifas" routerLinkActive="active">Tarifas</a></li>
              <li><a routerLink="/admin/tipos-vehiculo" routerLinkActive="active">Tipos de Vehículo</a></li>
              <li><a routerLink="/admin/tipos-pago" routerLinkActive="active">Tipos de Pago</a></li>
              <li><a routerLink="/admin/tipos-cliente" routerLinkActive="active">Tipos de Cliente</a></li>
              <li><a routerLink="/admin/tarjetas-rfid" routerLinkActive="active">Tarjetas RFID</a></li>
              <li><a routerLink="/admin/usuarios" routerLinkActive="active">Usuarios</a></li>
            </ul>
          </nav>
        </aside>

        <!-- Main Content Area -->
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      background: #2c3e50;
      color: white;
      padding: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 1000;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      max-width: none;
    }

    .header h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logout-btn {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .logout-btn:hover {
      background: #c0392b;
    }

    .main-container {
      display: flex;
      flex: 1;
      min-height: calc(100vh - 80px);
    }

    .sidebar {
      width: 280px;
      background: #34495e;
      color: white;
      padding: 0;
      box-shadow: 2px 0 4px rgba(0,0,0,0.1);
      overflow-y: auto;
    }

    .nav-menu {
      padding: 1.5rem;
    }

    .nav-menu h2 {
      margin: 0 0 1.5rem 0;
      color: #ecf0f1;
      font-size: 1.2rem;
      font-weight: 500;
      border-bottom: 1px solid #4a6741;
      padding-bottom: 0.5rem;
    }

    .nav-menu ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-menu li {
      margin-bottom: 0.5rem;
    }

    .nav-menu a {
      display: block;
      color: #bdc3c7;
      text-decoration: none;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      transition: all 0.3s ease;
      font-size: 0.95rem;
    }

    .nav-menu a:hover {
      background: #4a6741;
      color: white;
      transform: translateX(4px);
    }

    .nav-menu a.active {
      background: #3498db;
      color: white;
      font-weight: 500;
    }

    .content {
      flex: 1;
      padding: 2rem;
      background: #f8f9fa;
      overflow-y: auto;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .main-container {
        flex-direction: column;
      }
      
      .sidebar {
        width: 100%;
        order: 2;
      }
      
      .content {
        order: 1;
        padding: 1rem;
      }
      
      .header-content {
        padding: 1rem;
      }
      
      .header h1 {
        font-size: 1.2rem;
      }
    }
  `]
})
export class AdminLayoutComponent {
  constructor() {}
}