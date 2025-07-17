import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CarrilesService, EstacionesService, Carril, Estacion, PaginatedResponse } from '@toll-suite/data-access';

@Component({
  selector: 'app-carriles',
  template: `
    <div class="carriles-page">
      <div class="page-header">
        <div>
          <h1>Gestión de Carriles</h1>
          <p>Administrar los carriles de las estaciones de peaje</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="onRefresh()">
            <i class="fas fa-sync"></i>
            Actualizar
          </button>
          <button class="btn btn-primary" (click)="onAdd()">
            <i class="fas fa-plus"></i>
            Nuevo Carril
          </button>
        </div>
      </div>

      <div class="table-controls">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Buscar carriles..." 
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            class="search-input"
          >
          <i class="fas fa-search search-icon"></i>
        </div>
        <div class="filter-controls">
          <select [(ngModel)]="selectedEstacion" (change)="onFilterByEstacion()" class="filter-select">
            <option value="">Todas las estaciones ({{ estaciones.length }})</option>
            <option *ngFor="let estacion of estaciones; trackBy: trackByEstacionId" [value]="estacion.id">
              {{ estacion.nombre }}
            </option>
          </select>
          <select [(ngModel)]="selectedTipoCarril" (change)="onFilterByTipo()" class="filter-select">
            <option value="">Todos los tipos</option>
            <option value="Normal">Normal</option>
            <option value="Telepeaje">Telepeaje</option>
            <option value="Especial">Especial</option>
          </select>
          <select [(ngModel)]="selectedEstado" (change)="onFilterByEstado()" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Mantenimiento">Mantenimiento</option>
          </select>
        </div>
      </div>

      <div class="table-container" *ngIf="!loading">
        <table class="data-table">
          <thead>
            <tr>
              <th (click)="sort('numero')" class="sortable">
                Número
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th (click)="sort('estacion.nombre')" class="sortable">
                Estación
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th (click)="sort('tipo')" class="sortable">
                Tipo
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th (click)="sort('estado')" class="sortable">
                Estado
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th class="actions-column">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let carril of pagedCarriles; trackBy: trackByCarrilId" class="table-row">
              <td>{{ carril.numero }}</td>
              <td class="font-medium">{{ carril.estacion?.nombre || 'N/A' }}</td>
              <td>
                <span class="tipo-badge" [class]="getTipoCarrilClass(carril.tipo)">
                  {{ carril.tipo }}
                </span>
              </td>
              <td>
                <span class="estado-badge" [class]="getEstadoClass(carril.estado)">
                  {{ carril.estado }}
                </span>
              </td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    class="btn-action btn-edit" 
                    (click)="onEdit(carril)"
                    title="Editar carril"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn-action btn-delete" 
                    (click)="onDelete(carril)"
                    title="Eliminar carril"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="no-data" *ngIf="pagedCarriles.length === 0 && !loading">
          <i class="fas fa-road"></i>
          <h3>No hay carriles disponibles</h3>
          <p>No se pudieron cargar los carriles desde el servidor, o no hay carriles registrados en el sistema.</p>
          <div class="no-data-actions">
            <button class="btn btn-primary" (click)="onAdd()">
              <i class="fas fa-plus"></i>
              Agregar Carril
            </button>
            <button class="btn btn-secondary" (click)="onRefresh()">
              <i class="fas fa-sync"></i>
              Intentar Nuevamente
            </button>
            <button class="btn btn-secondary" (click)="loadMockData()">
              <i class="fas fa-database"></i>
              Cargar Datos de Prueba
            </button>
          </div>
        </div>

        <div class="table-footer">
          <div class="table-info">
            Mostrando {{ (currentPage - 1) * pageSize + 1 }} - {{ getMaxShown() }} 
            de {{ totalCarriles }} carriles
          </div>
          <div class="pagination">
            <button 
              class="btn btn-sm" 
              (click)="goToPage(currentPage - 1)"
              [disabled]="currentPage === 1"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
            <button 
              class="btn btn-sm" 
              (click)="goToPage(currentPage + 1)"
              [disabled]="currentPage === totalPages"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="loading-container" *ngIf="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando carriles...</p>
      </div>

      <!-- Carril Form Modal -->
      <app-carril-form
        [isOpen]="showCarrilForm"
        [carril]="selectedCarril"
        [isSubmitting]="isSubmitting"
        [estaciones]="estaciones"
        (save)="onSaveCarril($event)"
        (cancel)="onCancelForm()"
      ></app-carril-form>

      <!-- Confirm Dialog -->
      <div class="modal-overlay" *ngIf="showDeleteDialog" (click)="cancelDelete()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Confirmar Eliminación</h3>
          </div>
          <div class="modal-body">
            <p>¿Está seguro que desea eliminar el carril <strong>{{ carrilToDelete?.numero }}</strong> de la estación <strong>{{ carrilToDelete?.estacion?.nombre }}</strong>?</p>
            <p class="text-warning">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cancelDelete()">
              Cancelar
            </button>
            <button type="button" class="btn btn-danger" (click)="confirmDelete()">
              <i class="fas fa-trash"></i>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .carriles-page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e9ecef;
    }
    
    .page-header div:first-child h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c3e50;
    }
    
    .page-header div:first-child p {
      margin: 0;
      color: #6c757d;
      font-size: 1.1rem;
    }
    
    .header-actions {
      display: flex;
      gap: 1rem;
    }
    
    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .search-box {
      position: relative;
      flex: 1;
      max-width: 400px;
    }
    
    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1px solid #ced4da;
      border-radius: 25px;
      font-size: 1rem;
      background: white;
      transition: all 0.2s ease;
    }
    
    .search-input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
      pointer-events: none;
    }
    
    .filter-controls {
      display: flex;
      gap: 1rem;
    }
    
    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      background: white;
      font-size: 0.9rem;
      min-width: 150px;
    }
    
    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    
    .data-table th {
      background: #f8f9fa;
      padding: 1rem 0.75rem;
      text-align: left;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
      white-space: nowrap;
    }
    
    .data-table th.sortable {
      cursor: pointer;
      user-select: none;
      position: relative;
      transition: background-color 0.2s ease;
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
      padding: 1rem 0.75rem;
      border-bottom: 1px solid #dee2e6;
      vertical-align: middle;
    }
    
    .table-row:hover {
      background: #f8f9fa;
    }
    
    .font-medium {
      font-weight: 500;
    }
    
    .tipo-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }
    
    .tipo-normal {
      background: #e3f2fd;
      color: #1565c0;
    }
    
    .tipo-telepeaje {
      background: #fff3e0;
      color: #ef6c00;
    }
    
    .tipo-especial {
      background: #f3e5f5;
      color: #7b1fa2;
    }
    
    .estado-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }
    
    .estado-activo {
      background: #d4edda;
      color: #155724;
    }
    
    .estado-inactivo {
      background: #f8d7da;
      color: #721c24;
    }
    
    .estado-mantenimiento {
      background: #fff3cd;
      color: #856404;
    }
    
    .actions-column {
      width: 120px;
      text-align: center;
    }
    
    .actions-cell {
      text-align: center;
    }
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }
    
    .btn-action {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }
    
    .btn-edit {
      background: #fff3e0;
      color: #ef6c00;
    }
    
    .btn-edit:hover {
      background: #ffe0b2;
    }
    
    .btn-delete {
      background: #ffebee;
      color: #d32f2f;
    }
    
    .btn-delete:hover {
      background: #ffcdd2;
    }
    
    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
    }
    
    .table-info {
      color: #6c757d;
      font-size: 0.9rem;
    }
    
    .pagination {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .page-info {
      font-size: 0.9rem;
      color: #495057;
    }
    
    .loading-container {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .loading-container i {
      font-size: 3rem;
      color: #007bff;
      margin-bottom: 1rem;
    }
    
    .no-data {
      text-align: center;
      padding: 3rem 2rem;
      background: white;
      border-radius: 8px;
      color: #6c757d;
    }
    
    .no-data i {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: #dee2e6;
    }
    
    .no-data h3 {
      margin: 1rem 0 0.5rem 0;
      color: #495057;
      font-size: 1.5rem;
    }
    
    .no-data p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }
    
    .no-data-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: #545b62;
    }
    
    .btn-danger {
      background: #dc3545;
      color: white;
    }
    
    .btn-danger:hover:not(:disabled) {
      background: #c82333;
    }
    
    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.8rem;
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
      padding: 1rem;
    }
    
    .modal-content {
      background: white;
      border-radius: 8px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
      border-radius: 8px 8px 0 0;
    }
    
    .modal-header h2, .modal-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.3rem;
      font-weight: 600;
    }
    
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6c757d;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .btn-close:hover {
      background: #e9ecef;
      color: #495057;
    }
    
    .modal-body {
      padding: 1.5rem;
    }
    
    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .form-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 6px;
      border-left: 4px solid #007bff;
    }
    
    .form-section h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #495057;
    }
    
    .form-control {
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      background: white;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .form-control.is-invalid {
      border-color: #dc3545;
    }
    
    .invalid-feedback {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
      border-radius: 0 0 8px 8px;
    }
    
    .text-warning {
      color: #856404;
      font-style: italic;
    }
    
    @media (max-width: 1200px) {
      .carriles-page {
        padding: 0.5rem;
      }
      
      .page-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }
      
      .header-actions {
        justify-content: center;
      }
      
      .data-table {
        font-size: 0.8rem;
      }
      
      .data-table th,
      .data-table td {
        padding: 0.5rem;
      }
    }
    
    @media (max-width: 768px) {
      .table-controls {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filter-controls {
        flex-wrap: wrap;
      }
      
      .filter-select {
        min-width: auto;
        flex: 1;
      }
      
      .table-container {
        overflow-x: auto;
      }
      
      .data-table {
        min-width: 800px;
      }
      
      .modal-content {
        margin: 1rem;
        max-width: none;
      }
      
      .form-row {
        flex-direction: column;
      }
    }
  `]
})
export class CarrilesComponent implements OnInit {
  // Data properties
  carriles: Carril[] = [];
  estaciones: Estacion[] = [];
  pagedCarriles: Carril[] = [];
  
  // State properties
  loading = false;
  showCarrilForm = false;
  showDeleteDialog = false;
  isSubmitting = false;
  
  // Selected items
  selectedCarril: Carril | null = null;
  carrilToDelete: Carril | null = null;
  
  // Search and filter
  searchTerm = '';
  selectedEstacion = '';
  selectedTipoCarril = '';
  selectedEstado = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCarriles = 0;
  totalPages = 0;
  
  // Sorting
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private carrilesService: CarrilesService,
    private estacionesService: EstacionesService
  ) {}

  ngOnInit() {
    console.log('CarrilesComponent initialized');
    this.loading = true;
    
    // Load estaciones first
    this.loadEstaciones();
    
    // Then load carriles
    this.loadCarriles();
  }

  loadEstaciones() {
    console.log('Loading estaciones...');
    this.estacionesService.getAll().subscribe({
      next: (response: PaginatedResponse<Estacion> | Estacion[]) => {
        console.log('API response for estaciones:', response);
        
        // Handle both paginated and direct array responses
        if (Array.isArray(response)) {
          this.estaciones = response;
        } else if (response && response.data) {
          this.estaciones = response.data;
        } else {
          console.warn('Unexpected response format:', response);
          this.estaciones = [];
        }
        
        console.log('Estaciones loaded successfully. Count:', this.estaciones.length);
      },
      error: (error: any) => {
        console.error('Error loading estaciones:', error);
        this.estaciones = this.getMockEstaciones();
      }
    });
  }

  loadCarriles() {
    console.log('Attempting to load carriles from API...');
    
    this.carrilesService.getAll().subscribe({
      next: (response: PaginatedResponse<Carril> | Carril[]) => {
        console.log('API response for carriles:', response);
        
        // Handle both paginated and direct array responses
        let apiCarriles: Carril[] = [];
        if (Array.isArray(response)) {
          apiCarriles = response;
        } else if (response && response.data) {
          apiCarriles = response.data || [];
        }
        
        // Associate estaciones with carriles
        if (this.estaciones.length > 0) {
          apiCarriles.forEach(carril => {
            if (carril.estacionId) {
              carril.estacion = this.estaciones.find(e => e.id === carril.estacionId);
            }
          });
        }
        
        console.log('Loading API data:', apiCarriles.length, 'records');
        this.carriles = apiCarriles;
        this.totalCarriles = apiCarriles.length;
        this.filterAndPaginateCarriles();
        this.loading = false;
      },
      error: (error: any) => {
        console.warn('API not available:', error);
        this.carriles = [];
        this.totalCarriles = 0;
        this.loading = false;
        this.filterAndPaginateCarriles();
      }
    });
  }

  loadMockData() {
    console.log('Loading mock carriles data...');
    
    // Get mock estaciones if none loaded yet
    if (this.estaciones.length === 0) {
      this.estaciones = this.getMockEstaciones();
    }
    
    // Mock data for demonstration
    this.carriles = [
      {
        id: 1,
        estacionId: 1,
        estacion: this.estaciones[0] || { id: 1, nombre: 'Estación Norte', ubicacion: 'Norte', activo: true, fechaCreacion: new Date() },
        numero: 'C-01',
        tipo: 'Normal',
        estado: 'Activo',
        activo: true,
        fechaCreacion: new Date('2023-01-15')
      },
      {
        id: 2,
        estacionId: 1,
        estacion: this.estaciones[0] || { id: 1, nombre: 'Estación Norte', ubicacion: 'Norte', activo: true, fechaCreacion: new Date() },
        numero: 'C-02',
        tipo: 'Telepeaje',
        estado: 'Activo',
        activo: true,
        fechaCreacion: new Date('2023-01-15')
      },
      {
        id: 3,
        estacionId: 2,
        estacion: this.estaciones[1] || { id: 2, nombre: 'Estación Sur', ubicacion: 'Sur', activo: true, fechaCreacion: new Date() },
        numero: 'C-01',
        tipo: 'Normal',
        estado: 'Mantenimiento',
        activo: true,
        fechaCreacion: new Date('2023-02-20')
      },
      {
        id: 4,
        estacionId: 2,
        estacion: this.estaciones[1] || { id: 2, nombre: 'Estación Sur', ubicacion: 'Sur', activo: true, fechaCreacion: new Date() },
        numero: 'C-02',
        tipo: 'Especial',
        estado: 'Inactivo',
        activo: false,
        fechaCreacion: new Date('2023-02-20')
      }
    ];
    
    this.totalCarriles = this.carriles.length;
    this.loading = false;
    console.log('Mock carriles loaded successfully:', this.carriles.length, 'records');
    this.filterAndPaginateCarriles();
  }

  private getMockEstaciones(): Estacion[] {
    return [
      { id: 1, nombre: 'Estación Norte', ubicacion: 'Norte de la ciudad', descripcion: 'Estación principal de entrada norte', activo: true, fechaCreacion: new Date() },
      { id: 2, nombre: 'Estación Sur', ubicacion: 'Sur de la ciudad', descripcion: 'Estación principal de entrada sur', activo: true, fechaCreacion: new Date() },
      { id: 3, nombre: 'Estación Este', ubicacion: 'Este de la ciudad', descripcion: 'Estación secundaria este', activo: true, fechaCreacion: new Date() }
    ];
  }

  filterAndPaginateCarriles() {
    let filteredCarriles = [...this.carriles];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredCarriles = filteredCarriles.filter(carril =>
        carril.numero.toLowerCase().includes(term) ||
        carril.tipo.toLowerCase().includes(term) ||
        carril.estado.toLowerCase().includes(term) ||
        (carril.estacion?.nombre?.toLowerCase().includes(term) || false)
      );
    }

    // Apply estacion filter
    if (this.selectedEstacion) {
      filteredCarriles = filteredCarriles.filter(carril => 
        carril.estacionId?.toString() === this.selectedEstacion
      );
    }

    // Apply tipo filter
    if (this.selectedTipoCarril) {
      filteredCarriles = filteredCarriles.filter(carril => 
        carril.tipo === this.selectedTipoCarril
      );
    }

    // Apply estado filter
    if (this.selectedEstado) {
      filteredCarriles = filteredCarriles.filter(carril => 
        carril.estado === this.selectedEstado
      );
    }

    // Apply sorting
    if (this.sortField) {
      filteredCarriles.sort((a, b) => {
        let aValue = this.getFieldValue(a, this.sortField);
        let bValue = this.getFieldValue(b, this.sortField);
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Update totals
    this.totalCarriles = filteredCarriles.length;
    this.totalPages = Math.ceil(this.totalCarriles / this.pageSize);

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedCarriles = filteredCarriles.slice(startIndex, endIndex);

    // Adjust current page if necessary
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
      this.filterAndPaginateCarriles();
    }
  }

  private getFieldValue(obj: any, field: string): any {
    return field.split('.').reduce((o, f) => o?.[f], obj) || '';
  }

  // Event handlers
  onSearch() {
    this.currentPage = 1;
    this.filterAndPaginateCarriles();
  }

  onFilterByEstacion() {
    this.currentPage = 1;
    this.filterAndPaginateCarriles();
  }

  onFilterByTipo() {
    this.currentPage = 1;
    this.filterAndPaginateCarriles();
  }

  onFilterByEstado() {
    this.currentPage = 1;
    this.filterAndPaginateCarriles();
  }

  sort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filterAndPaginateCarriles();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterAndPaginateCarriles();
    }
  }

  // CRUD operations
  onAdd() {
    console.log('onAdd() called - Opening carril form');
    this.selectedCarril = null;
    this.showCarrilForm = true;
  }

  onEdit(carril: Carril) {
    this.selectedCarril = carril;
    this.showCarrilForm = true;
  }

  onDelete(carril: Carril) {
    this.carrilToDelete = carril;
    this.showDeleteDialog = true;
  }

  onRefresh() {
    console.log('Refreshing carriles data...');
    this.searchTerm = '';
    this.selectedEstacion = '';
    this.selectedTipoCarril = '';
    this.selectedEstado = '';
    this.currentPage = 1;
    this.loading = true;
    
    // Clear current data
    this.carriles = [];
    this.pagedCarriles = [];
    
    // Reload data from API only
    this.loadEstaciones();
    this.loadCarriles();
  }

  onSaveCarril(carrilData: Partial<Carril>) {
    this.isSubmitting = true;
    
    if (carrilData.id) {
      // Edit existing carril
      this.carrilesService.update(carrilData.id, carrilData).subscribe({
        next: () => {
          console.log('Carril updated successfully');
          this.loadCarriles();
          this.onCancelForm();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating carril:', error);
          alert('No se pudo actualizar el carril. Verifique la conexión con el servidor.');
          this.isSubmitting = false;
        }
      });
    } else {
      // Add new carril
      const newCarrilData = {
        ...carrilData,
        activo: true
      };
      
      this.carrilesService.create(newCarrilData).subscribe({
        next: () => {
          console.log('Carril created successfully');
          this.loadCarriles();
          this.onCancelForm();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating carril:', error);
          alert('No se pudo crear el carril. Verifique la conexión con el servidor.');
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancelForm() {
    this.showCarrilForm = false;
    this.selectedCarril = null;
  }

  confirmDelete() {
    if (this.carrilToDelete) {
      this.carrilesService.delete(this.carrilToDelete.id).subscribe({
        next: () => {
          console.log('Carril deleted successfully');
          this.loadCarriles();
          this.cancelDelete();
        },
        error: (error) => {
          console.error('Error deleting carril:', error);
          alert('No se pudo eliminar el carril. Verifique la conexión con el servidor.');
          this.cancelDelete();
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteDialog = false;
    this.carrilToDelete = null;
  }

  // Utility methods
  getTipoCarrilClass(tipo: string): string {
    if (!tipo) return '';
    return 'tipo-' + tipo.toLowerCase().replace(/\s+/g, '-');
  }

  getEstadoClass(estado: string): string {
    if (!estado) return '';
    return 'estado-' + estado.toLowerCase().replace(/\s+/g, '-');
  }

  getMaxShown(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCarriles);
  }

  // Removed isFieldInvalid since we're using CarrilFormComponent

  // TrackBy functions for performance
  trackByCarrilId(index: number, carril: Carril): number {
    return carril.id;
  }

  trackByEstacionId(index: number, estacion: Estacion): number {
    return estacion.id;
  }
}
