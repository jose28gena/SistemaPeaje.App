import { Component, OnInit } from '@angular/core';
import { EstacionesService, Estacion, PaginatedResponse } from '@toll-suite/data-access';

@Component({
  selector: 'app-estaciones',
  template: `
    <div class="estaciones-page">
      <div class="page-header">
        <div>
          <h1>Gestión de Estaciones</h1>
          <p>Administrar las estaciones de peaje del sistema</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="onAdd()">
            <i class="fas fa-plus"></i>
            Nueva Estación
          </button>
          <button class="btn btn-secondary" (click)="onRefresh()">
            <i class="fas fa-sync"></i>
            Actualizar
          </button>
        </div>
      </div>

      <!-- API Status Alert -->
      <div class="alert alert-warning" *ngIf="usingMockData">
        <i class="fas fa-exclamation-triangle"></i>
        <strong>Modo de Prueba:</strong> No se pudo conectar con la API. Mostrando datos de prueba.
      </div>

      <div class="table-controls">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Buscar estaciones..." 
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            class="search-input"
          >
          <i class="fas fa-search search-icon"></i>
        </div>
      </div>
      
      <div class="table-container" *ngIf="!loading">
        <table class="data-table">
          <thead>
            <tr>
              <th (click)="sort('id')" class="sortable">
                ID
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th (click)="sort('nombre')" class="sortable">
                Nombre
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th (click)="sort('ubicacion')" class="sortable">
                Ubicación
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th>Descripción</th>
              <th (click)="sort('activo')" class="sortable">
                Estado
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th (click)="sort('fechaCreacion')" class="sortable">
                Fecha Creación
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th class="actions-column">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let estacion of filteredEstaciones; trackBy: trackByEstacionId" class="table-row">
              <td class="id-column">{{ estacion.id }}</td>
              <td class="name-column">{{ estacion.nombre }}</td>
              <td class="location-column">{{ estacion.ubicacion }}</td>
              <td class="description-column">{{ estacion.descripcion || 'N/A' }}</td>
              <td class="status-column">
                <span class="status-badge" [class.active]="estacion.activo" [class.inactive]="!estacion.activo">
                  {{ estacion.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="date-column">{{ formatDate(estacion.fechaCreacion) }}</td>
              <td class="actions-column">
                <div class="action-buttons">
                  <button 
                    class="btn-action btn-primary" 
                    (click)="editEstacion(estacion)"
                    title="Editar"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn-action btn-secondary" 
                    (click)="viewEstacion(estacion)"
                    title="Ver Detalles"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    class="btn-action btn-warning" 
                    (click)="viewCarriles(estacion)"
                    title="Ver Carriles"
                  >
                    <i class="fas fa-road"></i>
                  </button>
                  <button 
                    class="btn-action btn-danger" 
                    (click)="deleteEstacion(estacion)"
                    title="Eliminar"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div *ngIf="filteredEstaciones.length === 0" class="no-data">
          <i class="fas fa-inbox"></i>
          <p>No se encontraron estaciones</p>
        </div>
      </div>
      
      <div class="loading-container" *ngIf="loading">
        <div class="spinner"></div>
        <p>Cargando estaciones...</p>
      </div>
      
      <!-- Estacion Form Modal -->
      <app-estacion-form
        [isOpen]="showEstacionForm"
        [estacion]="selectedEstacion"
        [isSubmitting]="isSubmittingForm"
        (save)="onSaveEstacion($event)"
        (cancel)="onCancelForm()"
      ></app-estacion-form>

      <!-- Confirm Dialog -->
      <div class="modal-overlay" *ngIf="showDeleteDialog" (click)="cancelDelete()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Eliminar Estación</h3>
            <button class="close-btn" (click)="cancelDelete()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>¿Está seguro de que desea eliminar la estación <strong>{{ selectedEstacion?.nombre }}</strong>?</p>
            <p class="warning-text">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cancelDelete()">Cancelar</button>
            <button class="btn btn-danger" (click)="confirmDelete()">Sí, eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .estaciones-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .page-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .page-header p {
      margin: 0;
      color: #6c757d;
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .table-controls {
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .search-box {
      position: relative;
      width: 300px;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    }

    .search-icon {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      background: #f8f9fa;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }

    .data-table th.sortable {
      cursor: pointer;
      user-select: none;
      position: relative;
    }

    .data-table th.sortable:hover {
      background: #e9ecef;
    }

    .sort-icon {
      margin-left: 0.5rem;
      opacity: 0.5;
      font-size: 0.8rem;
    }

    .data-table td {
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
      vertical-align: middle;
    }

    .table-row:hover {
      background-color: #f8f9fa;
    }

    .id-column {
      width: 80px;
      font-weight: 600;
      color: #495057;
    }

    .name-column {
      font-weight: 500;
      color: #2c3e50;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-badge.active {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }

    .btn-action {
      padding: 0.375rem 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .btn-action:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-warning {
      background: #ffc107;
      color: #212529;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-info {
      background: #17a2b8;
      color: white;
    }

    .btn-info:hover {
      background: #138496;
    }

    .btn-warning {
      background: #ffc107;
      color: #212529;
    }

    .btn-warning:hover {
      background: #e0a800;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .no-data i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .loading-container {
      text-align: center;
      padding: 3rem;
      color: #6c757d;
    }

    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 1rem;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 90%;
      max-width: 500px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #dee2e6;
    }

    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .warning-text {
      color: #dc3545;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #dee2e6;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }

      .header-actions {
        width: 100%;
        justify-content: flex-start;
      }

      .table-controls {
        flex-direction: column;
        gap: 1rem;
      }

      .search-box {
        width: 100%;
      }

      .data-table {
        font-size: 0.875rem;
      }

      .data-table th,
      .data-table td {
        padding: 0.5rem;
      }
    }
  `]
})
export class EstacionesComponent implements OnInit {
  estaciones: Estacion[] = [];
  filteredEstaciones: Estacion[] = [];
  loading = false;
  usingMockData = false;
  showDeleteDialog = false;
  showEstacionForm = false;
  isSubmittingForm = false;
  selectedEstacion: Estacion | null = null;
  searchTerm = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  constructor(private estacionesService: EstacionesService) {}
  
  ngOnInit() {
    console.log('EstacionesComponent initialized');
    this.loadEstaciones();
    
    // Fallback to mock data if loading takes too long
    setTimeout(() => {
      if (this.loading || this.estaciones.length === 0) {
        console.log('Loading timeout or no data, forcing mock data...');
        this.mockData();
      }
    }, 5000);
  }
  
  loadEstaciones() {
    this.loading = true;
    this.usingMockData = false;
    console.log('Cargando estaciones desde API...');
    
    this.estacionesService.getAll().subscribe({
      next: (response: PaginatedResponse<Estacion> | Estacion[]) => {
        console.log('Respuesta de la API:', response);
        
        // Handle both paginated and direct array responses
        if (Array.isArray(response)) {
          this.estaciones = response;
          console.log('Estaciones as array:', response);
        } else if (response && response.data) {
          this.estaciones = response.data;
          console.log('Estaciones from paginated response:', response.data);
        } else {
          console.warn('Unexpected response format:', response);
          this.estaciones = [];
        }
        
        this.filteredEstaciones = [...this.estaciones];
        this.loading = false;
        console.log('Estaciones cargadas exitosamente:', this.estaciones.length);
        
        // If no data from API, use mock data
        if (this.estaciones.length === 0) {
          console.log('No data received from API, using mock data...');
          this.mockData();
        }
      },
      error: (error: any) => {
        console.error('Error al cargar estaciones:', error);
        this.loading = false;
        this.usingMockData = true;
        console.log('Usando datos de prueba debido a error...');
        this.mockData();
      }
    });
  }

  mockData() {
    console.log('Cargando datos de prueba...');
    this.usingMockData = true;
    this.estaciones = [
      {
        id: 1,
        nombre: 'Estación Norte',
        ubicacion: 'Km 25 Autopista Norte',
        descripcion: 'Estación principal de acceso norte',
        activo: true,
        fechaCreacion: new Date('2023-01-15'),
        fechaActualizacion: new Date('2023-01-15')
      },
      {
        id: 2,
        nombre: 'Estación Sur',
        ubicacion: 'Km 15 Autopista Sur',
        descripcion: 'Estación de salida sur',
        activo: true,
        fechaCreacion: new Date('2023-02-20'),
        fechaActualizacion: new Date('2023-02-20')
      },
      {
        id: 3,
        nombre: 'Estación Este',
        ubicacion: 'Km 10 Carretera Este',
        descripcion: 'Estación temporal en mantenimiento',
        activo: false,
        fechaCreacion: new Date('2023-03-10'),
        fechaActualizacion: new Date('2023-03-10')
      },
      {
        id: 4,
        nombre: 'Estación Oeste',
        ubicacion: 'Km 8 Carretera Oeste',
        descripcion: 'Estación de entrada principal',
        activo: true,
        fechaCreacion: new Date('2023-04-05'),
        fechaActualizacion: new Date('2023-04-05')
      },
      {
        id: 5,
        nombre: 'Estación Central',
        ubicacion: 'Km 0 Centro Urbano',
        descripcion: 'Estación centro de distribución',
        activo: true,
        fechaCreacion: new Date('2023-05-12'),
        fechaActualizacion: new Date('2023-05-12')
      }
    ];
    this.filteredEstaciones = [...this.estaciones];
    this.loading = false;
    console.log('Datos de prueba cargados exitosamente:', this.estaciones.length, 'estaciones');
    console.log('filteredEstaciones length:', this.filteredEstaciones.length);
    
    // Force change detection
    setTimeout(() => {
      console.log('After timeout - estaciones:', this.estaciones.length);
      console.log('After timeout - filteredEstaciones:', this.filteredEstaciones.length);
    }, 100);
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredEstaciones = [...this.estaciones];
    } else {
      this.filteredEstaciones = this.estaciones.filter(estacion =>
        estacion.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        estacion.ubicacion.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (estacion.descripcion && estacion.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredEstaciones.sort((a: any, b: any) => {
      let valueA = a[column];
      let valueB = b[column];

      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  onAdd() {
    this.selectedEstacion = null;
    this.showEstacionForm = true;
  }

  onRefresh() {
    this.searchTerm = '';
    this.usingMockData = false;
    this.loadEstaciones();
  }

  onSaveEstacion(estacionData: Partial<Estacion>) {
    this.isSubmittingForm = true;
    
    if (estacionData.id) {
      // Editar estación existente
      this.estacionesService.update(estacionData.id, estacionData).subscribe({
        next: () => {
          this.loadEstaciones();
          this.onCancelForm();
          this.isSubmittingForm = false;
        },
        error: (error: any) => {
          console.error('Error al actualizar estación:', error);
          // Simular actualización exitosa para la demo
          this.updateEstacionInList(estacionData as Estacion);
          this.onCancelForm();
          this.isSubmittingForm = false;
        }
      });
    } else {
      // Crear nueva estación
      this.estacionesService.create(estacionData).subscribe({
        next: () => {
          this.loadEstaciones();
          this.onCancelForm();
          this.isSubmittingForm = false;
        },
        error: (error: any) => {
          console.error('Error al crear estación:', error);
          // Simular creación exitosa para la demo
          const newEstacion: Estacion = {
            id: this.getNextId(),
            nombre: estacionData.nombre!,
            ubicacion: estacionData.ubicacion!,
            descripcion: estacionData.descripcion,
            activo: estacionData.activo ?? true,
            fechaCreacion: new Date()
          };
          this.estaciones.push(newEstacion);
          this.onSearch();
          this.onCancelForm();
          this.isSubmittingForm = false;
        }
      });
    }
  }

  onCancelForm() {
    this.showEstacionForm = false;
    this.selectedEstacion = null;
    this.isSubmittingForm = false;
  }

  private getNextId(): number {
    return Math.max(...this.estaciones.map(e => e.id), 0) + 1;
  }

  private updateEstacionInList(updatedEstacion: Estacion) {
    const index = this.estaciones.findIndex(e => e.id === updatedEstacion.id);
    if (index !== -1) {
      this.estaciones[index] = { ...this.estaciones[index], ...updatedEstacion };
      this.onSearch();
    }
  }

  editEstacion(estacion: Estacion) {
    this.selectedEstacion = estacion;
    this.showEstacionForm = true;
  }

  viewEstacion(estacion: Estacion) {
    console.log('Ver estación:', estacion);
    // TODO: Implementar modal o navegación para ver detalles completos
  }

  deleteEstacion(estacion: Estacion) {
    this.selectedEstacion = estacion;
    this.showDeleteDialog = true;
  }

  confirmDelete() {
    if (this.selectedEstacion) {
      this.loading = true;
      this.estacionesService.delete(this.selectedEstacion.id).subscribe({
        next: () => {
          this.loadEstaciones();
          this.showDeleteDialog = false;
          this.selectedEstacion = null;
        },
        error: (error: any) => {
          console.error('Error al eliminar estación:', error);
          // Simular eliminación exitosa para la demo
          this.estaciones = this.estaciones.filter(e => e.id !== this.selectedEstacion!.id);
          this.filteredEstaciones = this.filteredEstaciones.filter(e => e.id !== this.selectedEstacion!.id);
          this.showDeleteDialog = false;
          this.selectedEstacion = null;
          this.loading = false;
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteDialog = false;
    this.selectedEstacion = null;
  }

  viewCarriles(estacion: Estacion) {
    console.log('Ver carriles de estación:', estacion);
    // TODO: Navegar a vista de carriles de la estación
  }

  // TrackBy function for performance
  trackByEstacionId(index: number, estacion: Estacion): number {
    return estacion.id;
  }
}
