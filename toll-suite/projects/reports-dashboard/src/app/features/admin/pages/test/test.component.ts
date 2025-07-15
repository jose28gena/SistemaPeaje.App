import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Dashboard de Administración</h1>
        <p class="welcome-text">¡Bienvenido al sistema de gestión de peajes!</p>
      </div>
      
      <div class="dashboard-grid">
        <div class="card modules-card">
          <h2>Módulos de Gestión</h2>
          <div class="modules-grid">
            <a routerLink="/admin/estaciones" class="module-link">
              <div class="module-icon">🏢</div>
              <span>Estaciones</span>
            </a>
            <a routerLink="/admin/carriles" class="module-link">
              <div class="module-icon">🚗</div>
              <span>Carriles</span>
            </a>
            <a routerLink="/admin/empleados" class="module-link">
              <div class="module-icon">👥</div>
              <span>Empleados</span>
            </a>
            <a routerLink="/admin/clientes" class="module-link">
              <div class="module-icon">👤</div>
              <span>Clientes</span>
            </a>
            <a routerLink="/admin/tarifas" class="module-link">
              <div class="module-icon">💰</div>
              <span>Tarifas</span>
            </a>
            <a routerLink="/admin/tipos-vehiculo" class="module-link">
              <div class="module-icon">🚙</div>
              <span>Tipos de Vehículo</span>
            </a>
          </div>
        </div>
        
        <div class="card status-card">
          <h3>Estado del Sistema</h3>
          <div class="status-item">
            <span class="status-icon">✅</span>
            <span>Dashboard funcionando correctamente</span>
          </div>
          <div class="status-item">
            <span class="status-icon">✅</span>
            <span>Routing configurado</span>
          </div>
          <div class="status-item">
            <span class="status-icon">✅</span>
            <span>Componentes cargados</span>
          </div>
          <div class="status-item">
            <span class="status-icon">✅</span>
            <span>API disponible</span>
          </div>
        </div>
        
        <div class="card stats-card">
          <h3>Estadísticas Rápidas</h3>
          <div class="stat-item">
            <div class="stat-number">12</div>
            <div class="stat-label">Estaciones Activas</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">48</div>
            <div class="stat-label">Carriles en Operación</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">256</div>
            <div class="stat-label">Empleados Registrados</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
      font-size: 2.5rem;
    }

    .welcome-text {
      color: #7f8c8d;
      font-size: 1.2rem;
      margin: 0;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      grid-template-rows: auto auto;
      gap: 1.5rem;
      grid-template-areas: 
        "modules status"
        "stats stats";
    }

    .card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      border: 1px solid #e9ecef;
    }

    .modules-card {
      grid-area: modules;
    }

    .status-card {
      grid-area: status;
    }

    .stats-card {
      grid-area: stats;
    }

    .card h2, .card h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: #2c3e50;
    }

    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .module-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
      text-decoration: none;
      color: #495057;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .module-link:hover {
      background: #3498db;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
    }

    .module-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .status-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .status-icon {
      margin-right: 0.5rem;
      font-size: 1.2rem;
    }

    .stats-card {
      display: flex;
      justify-content: space-around;
      align-items: center;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #3498db;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
        grid-template-areas: 
          "modules"
          "status"
          "stats";
      }
      
      .modules-grid {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      }
      
      .stats-card {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class TestComponent {
}
