import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClientesService, TiposClienteService, Cliente, TipoCliente, PaginatedResponse } from '@toll-suite/data-access';
import { Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-clientes',
  template: `
    <div class="clientes-page">
      <div class="page-header">
        <div>
          <h1>Gestión de Clientes</h1>
          <p>Administrar los clientes del sistema de peaje</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="onRefresh()">
            <i class="fas fa-sync"></i>
            Actualizar
          </button>
          <button class="btn btn-primary" (click)="onAdd()">
            <i class="fas fa-plus"></i>
            Nuevo Cliente
          </button>
        </div>
      </div>

      <div class="table-controls">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Buscar clientes..." 
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            class="search-input"
          >
          <i class="fas fa-search search-icon"></i>
        </div>
        <div class="filter-controls">
          <select [(ngModel)]="selectedTipoCliente" (change)="onFilterByTipoCliente()" class="filter-select">
            <option value="">Todos los tipos ({{ tiposCliente.length }})</option>
            <option *ngFor="let tipo of tiposCliente; trackBy: trackByTipoClienteId" [value]="tipo.id">
              {{ tipo.nombre }}
            </option>
          </select>
          <select [(ngModel)]="selectedTipoDocumento" (change)="onFilterByTipoDocumento()" class="filter-select">
            <option value="">Todos los documentos</option>
            <option value="Cédula">Cédula</option>
            <option value="RUC">RUC</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
        </div>
      </div>

      <div class="table-container" *ngIf="!loading">
        <table class="data-table">
          <thead>
            <tr>
              <th (click)="sort('numeroDocumento')" class="sortable">
                Documento
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th (click)="sort('nombres')" class="sortable">
                Nombres
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th (click)="sort('apellidos')" class="sortable">
                Apellidos
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Tipo Cliente</th>
              <th>Tipo Documento</th>
              <th (click)="sort('fechaNacimiento')" class="sortable">
                Fecha Nacimiento
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th class="actions-column">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cliente of pagedClientes; trackBy: trackByClienteId" class="table-row">
              <td>{{ cliente.numeroDocumento }}</td>
              <td class="font-medium">{{ cliente.nombres }}</td>
              <td class="font-medium">{{ cliente.apellidos }}</td>
              <td>{{ cliente.email || 'N/A' }}</td>
              <td>{{ cliente.telefono || 'N/A' }}</td>
              <td>
                <span class="tipo-badge" [class]="getTipoClienteClass(cliente.tipoCliente.nombre || '')" *ngIf="cliente.tipoCliente">
                  {{ cliente.tipoCliente.nombre }}
                </span>
                <span class="tipo-badge tipo-default" *ngIf="!cliente.tipoCliente">
                  Sin tipo
                </span>
              </td>
              <td>
                <span class="documento-badge" [class]="getTipoDocumentoClass(cliente.tipoDocumento || '')">
                  {{ cliente.tipoDocumento || 'N/A' }}
                </span>
              </td>
              <td>{{ formatDate(cliente.fechaNacimiento || '') }}</td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    class="btn-action btn-view" 
                    (click)="onView(cliente)"
                    title="Ver detalles"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    class="btn-action btn-edit" 
                    (click)="onEdit(cliente)"
                    title="Editar cliente"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn-action btn-delete" 
                    (click)="onDelete(cliente)"
                    title="Eliminar cliente"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="no-data" *ngIf="pagedClientes.length === 0 && !loading">
          <i class="fas fa-user-slash"></i>
          <h3>No hay clientes disponibles</h3>
          <p>No se pudieron cargar los clientes desde el servidor, o no hay clientes registrados en el sistema.</p>
          <div class="no-data-actions">
            <button class="btn btn-primary" (click)="onAdd()">
              <i class="fas fa-plus"></i>
              Agregar Cliente
            </button>
            <button class="btn btn-secondary" (click)="onRefresh()">
              <i class="fas fa-sync"></i>
              Intentar Nuevamente
            </button>
            <button class="btn btn-secondary" (click)="forceLoadMockData()">
              <i class="fas fa-database"></i>
              Cargar Datos de Prueba
            </button>
          </div>
        </div>

        <div class="table-footer">
          <div class="table-info">
            Mostrando {{ (currentPage - 1) * pageSize + 1 }} - {{ getMaxShown() }} 
            de {{ totalClientes }} clientes
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
        <p>Cargando clientes...</p>
      </div>

      <!-- Cliente Form Modal -->
      <app-cliente-form
        [isOpen]="showClienteForm"
        [cliente]="selectedCliente"
        [isSubmitting]="isSubmittingForm"
        [tiposCliente]="tiposCliente"
        (save)="onSaveCliente($event)"
        (cancel)="onCancelForm()"
      ></app-cliente-form>

      <!-- Confirm Dialog -->
      <div class="modal-overlay" *ngIf="showDeleteDialog" (click)="cancelDelete()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Confirmar Eliminación</h3>
          </div>
          <div class="modal-body">
            <p>¿Está seguro que desea eliminar al cliente <strong>{{ clienteToDelete?.nombres }} {{ clienteToDelete?.apellidos }}</strong>?</p>
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

      <!-- View Cliente Modal -->
      <div class="modal-overlay" *ngIf="showViewDialog" (click)="closeViewDialog()">
        <div class="modal-content view-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Detalles del Cliente</h3>
            <button class="btn-close" (click)="closeViewDialog()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body" *ngIf="selectedCliente">
            <div class="cliente-details">
              <div class="detail-section">
                <h4><i class="fas fa-user"></i> Información Personal</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Documento:</label>
                    <span>{{ selectedCliente.numeroDocumento }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Tipo Documento:</label>
                    <span>{{ selectedCliente.tipoDocumento || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Nombres:</label>
                    <span>{{ selectedCliente.nombres }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Apellidos:</label>
                    <span>{{ selectedCliente.apellidos }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Email:</label>
                    <span>{{ selectedCliente.email || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Teléfono:</label>
                    <span>{{ selectedCliente.telefono || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Dirección:</label>
                    <span>{{ selectedCliente.direccion || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Fecha de Nacimiento:</label>
                    <span>{{ formatDate(selectedCliente.fechaNacimiento || '') }}</span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4><i class="fas fa-tags"></i> Información del Cliente</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Tipo de Cliente:</label>
                    <span class="tipo-badge" [class]="getTipoClienteClass(selectedCliente.tipoCliente.nombre || '')" *ngIf="selectedCliente.tipoCliente">
                      {{ selectedCliente.tipoCliente.nombre }}
                    </span>
                    <span *ngIf="!selectedCliente.tipoCliente">Sin tipo asignado</span>
                  </div>
                  <div class="detail-item" *ngIf="selectedCliente.tipoCliente && selectedCliente.tipoCliente.descripcion">
                    <label>Descripción:</label>
                    <span>{{ selectedCliente.tipoCliente.descripcion }}</span>
                  </div>
                  <div class="detail-item" *ngIf="selectedCliente.tipoCliente && selectedCliente.tipoCliente.tieneDescuento">
                    <label>Descuento:</label>
                    <span class="descuento-badge">{{ selectedCliente.tipoCliente.descuentoPorcentaje }}%</span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4><i class="fas fa-calendar"></i> Información del Sistema</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Fecha de Creación:</label>
                    <span>{{ formatDate(selectedCliente.fechaCreacion) }}</span>
                  </div>
                  <div class="detail-item" *ngIf="selectedCliente.fechaActualizacion">
                    <label>Última Actualización:</label>
                    <span>{{ formatDate(selectedCliente.fechaActualizacion) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeViewDialog()">
              Cerrar
            </button>
            <button type="button" class="btn btn-primary" (click)="onEdit(selectedCliente!)">
              <i class="fas fa-edit"></i>
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clientes-page {
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
    
    .tipo-regular {
      background: #e3f2fd;
      color: #1565c0;
    }
    
    .tipo-vip {
      background: #fff3e0;
      color: #ef6c00;
    }
    
    .tipo-corporativo {
      background: #f3e5f5;
      color: #7b1fa2;
    }
    
    .tipo-descuento {
      background: #e8f5e8;
      color: #2e7d32;
    }
    
    .tipo-default {
      background: #e9ecef;
      color: #6c757d;
    }
    
    .documento-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }
    
    .documento-cedula {
      background: #d4edda;
      color: #155724;
    }
    
    .documento-ruc {
      background: #fff3cd;
      color: #856404;
    }
    
    .documento-pasaporte {
      background: #cce5ff;
      color: #004085;
    }
    
    .documento-default {
      background: #e9ecef;
      color: #6c757d;
    }
    
    .descuento-badge {
      background: #d4edda;
      color: #155724;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .puesto-default {
      background: #e9ecef;
      color: #6c757d;
    }
    
    .status-default {
      background: #e9ecef;
      color: #6c757d;
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
      gap: 0.25rem;
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
    
    .btn-view {
      background: #e3f2fd;
      color: #1565c0;
    }
    
    .btn-view:hover {
      background: #bbdefb;
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
    
    .view-modal {
      max-width: 800px;
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
    
    .modal-header h3 {
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
    
    .modal-body p {
      margin-bottom: 1rem;
      line-height: 1.5;
    }
    
    .text-warning {
      color: #856404;
      font-style: italic;
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
    
    /* Cliente Details Styles */
    .cliente-details {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .detail-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 6px;
      border-left: 4px solid #007bff;
    }
    
    .detail-section h4 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .detail-item label {
      font-weight: 500;
      color: #495057;
      font-size: 0.9rem;
    }
    
    .detail-item span {
      color: #2c3e50;
      font-size: 1rem;
    }
    
    @media (max-width: 1200px) {
      .clientes-page {
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
      
      .detail-grid {
        grid-template-columns: 1fr;
      }
      
      .modal-content {
        margin: 1rem;
        max-width: none;
      }
    }
  `]
})
export class ClientesComponent implements OnInit {
  // Data properties
  clientes: Cliente[] = [];
  tiposCliente: TipoCliente[] = [];
  pagedClientes: Cliente[] = [];
  
  // State properties
  loading = false;
  showClienteForm = false;
  showDeleteDialog = false;
  showViewDialog = false;
  isSubmittingForm = false;
  
  // Selected items
  selectedCliente: Cliente | null = null;
  clienteToDelete: Cliente | null = null;
  
  // Search and filter
  searchTerm = '';
  selectedTipoCliente = '';
  selectedTipoDocumento = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalClientes = 0;
  totalPages = 0;
  
  // Sorting
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private clientesService: ClientesService,
    private tiposClienteService: TiposClienteService
  ) {}

  ngOnInit() {
    console.log('ClientesComponent initialized');
    this.loading = true;
    
    // Load tipos de cliente
    this.loadTiposCliente();
    
    // Only try to load real data from API
    this.loadClientes();
  }

  loadClientes() {
    console.log('Attempting to load clientes from API...');
    
    this.clientesService.getAll().subscribe({
      next: (response: PaginatedResponse<Cliente> | Cliente[]) => {
        console.log('API response for clientes:', response);
        
        // Handle both paginated and direct array responses
        let apiClientes: Cliente[] = [];
        if (Array.isArray(response)) {
          apiClientes = response;
        } else if (response && response.data) {
          apiClientes = response.data || [];
        }
        
        console.log('Loading API data:', apiClientes.length, 'records');
        this.clientes = apiClientes;
        this.totalClientes = apiClientes.length;
        this.filterAndPaginateClientes();
        this.loading = false;
      },
      error: (error: any) => {
        console.warn('API not available:', error);
        this.clientes = [];
        this.totalClientes = 0;
        this.loading = false;
        this.filterAndPaginateClientes();
      }
    });
  }

  loadTiposCliente() {
    console.log('Loading tipos de cliente...');
    this.tiposClienteService.getAll().subscribe({
      next: (response: PaginatedResponse<TipoCliente> | TipoCliente[]) => {
        console.log('Raw API response for tipos cliente:', response);
        
        // Handle both paginated and direct array responses
        if (Array.isArray(response)) {
          this.tiposCliente = response;
        } else if (response && response.data) {
          this.tiposCliente = response.data;
        } else {
          console.warn('Unexpected response format:', response);
          this.tiposCliente = [];
        }
        
        console.log('Tipos cliente loaded successfully. Count:', this.tiposCliente.length);
      },
      error: (error: any) => {
        console.error('Error loading tipos cliente:', error);
        console.warn('Could not load tipos cliente, using mock data:', error);
        this.tiposCliente = this.getMockTiposCliente();
      }
    });
  }

  private loadMockClientes() {
    console.log('Loading mock clientes data...');
    
    // Mock data for demonstration
    this.clientes = [
      {
        id: 1,
        nombres: 'Juan Carlos',
        apellidos: 'Pérez González',
        numeroDocumento: '1234567890',
        tipoDocumento: 'Cédula',
        email: 'juan.perez@email.com',
        telefono: '+593 99 123 4567',
        direccion: 'Av. Principal 123, Sector Norte',
        fechaNacimiento: new Date('1985-03-15'),
        tipoClienteId: 1,
        tipoCliente: { id: 1, nombre: 'Regular', descripcion: 'Cliente regular', descuentoPorcentaje: 0, tieneDescuento: false, activo: true, fechaCreacion: new Date() },
        activo: true,
        fechaCreacion: new Date('2020-01-15'),
        fechaActualizacion: new Date('2024-01-10')
      },
      {
        id: 2,
        nombres: 'María Elena',
        apellidos: 'Rodríguez Silva',
        numeroDocumento: '0987654321',
        tipoDocumento: 'Cédula',
        email: 'maria.rodriguez@email.com',
        telefono: '+593 98 765 4321',
        direccion: 'Calle Secundaria 456, Centro',
        fechaNacimiento: new Date('1988-07-22'),
        tipoClienteId: 2,
        tipoCliente: { id: 2, nombre: 'VIP', descripcion: 'Cliente VIP', descuentoPorcentaje: 15, tieneDescuento: true, activo: true, fechaCreacion: new Date() },
        activo: true,
        fechaCreacion: new Date('2021-03-01'),
        fechaActualizacion: new Date('2024-02-15')
      },
      {
        id: 3,
        nombres: 'Empresa ABC',
        apellidos: 'S.A.',
        numeroDocumento: '1790123456001',
        tipoDocumento: 'RUC',
        email: 'contacto@empresaabc.com',
        telefono: '+593 02 123 4567',
        direccion: 'Av. Empresarial 789, Zona Industrial',
        fechaNacimiento: new Date('1995-01-01'),
        tipoClienteId: 3,
        tipoCliente: { id: 3, nombre: 'Corporativo', descripcion: 'Cliente corporativo', descuentoPorcentaje: 20, tieneDescuento: true, activo: true, fechaCreacion: new Date() },
        activo: true,
        fechaCreacion: new Date('2019-06-15'),
        fechaActualizacion: new Date('2024-03-20')
      }
    ];
    
    this.totalClientes = this.clientes.length;
    this.loading = false;
    console.log('Mock clientes loaded successfully:', this.clientes.length, 'records');
    this.filterAndPaginateClientes();
  }

  private getMockTiposCliente(): TipoCliente[] {
    return [
      { id: 1, nombre: 'Regular', descripcion: 'Cliente regular sin descuentos', descuentoPorcentaje: 0, tieneDescuento: false, activo: true, fechaCreacion: new Date() },
      { id: 2, nombre: 'VIP', descripcion: 'Cliente VIP con descuentos especiales', descuentoPorcentaje: 15, tieneDescuento: true, activo: true, fechaCreacion: new Date() },
      { id: 3, nombre: 'Corporativo', descripcion: 'Cliente corporativo con descuentos empresariales', descuentoPorcentaje: 20, tieneDescuento: true, activo: true, fechaCreacion: new Date() }
    ];
  }

  filterAndPaginateClientes() {
    let filteredClientes = [...this.clientes];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredClientes = filteredClientes.filter(cliente =>
        cliente.nombres.toLowerCase().includes(term) ||
        cliente.apellidos.toLowerCase().includes(term) ||
        cliente.numeroDocumento?.includes(term) ||
        cliente.email?.toLowerCase().includes(term)
      );
    }

    // Apply tipo cliente filter
    if (this.selectedTipoCliente) {
      filteredClientes = filteredClientes.filter(cliente => 
        cliente.tipoClienteId?.toString() === this.selectedTipoCliente
      );
    }

    // Apply tipo documento filter
    if (this.selectedTipoDocumento) {
      filteredClientes = filteredClientes.filter(cliente => 
        cliente.tipoDocumento === this.selectedTipoDocumento
      );
    }

    // Apply sorting
    if (this.sortField) {
      filteredClientes.sort((a, b) => {
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
    this.totalClientes = filteredClientes.length;
    this.totalPages = Math.ceil(this.totalClientes / this.pageSize);

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedClientes = filteredClientes.slice(startIndex, endIndex);

    // Adjust current page if necessary
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
      this.filterAndPaginateClientes();
    }
  }

  private getFieldValue(obj: any, field: string): any {
    return field.split('.').reduce((o, f) => o?.[f], obj) || '';
  }

  // Event handlers
  onSearch() {
    this.currentPage = 1;
    this.filterAndPaginateClientes();
  }

  onFilterByTipoCliente() {
    this.currentPage = 1;
    this.filterAndPaginateClientes();
  }

  onFilterByTipoDocumento() {
    this.currentPage = 1;
    this.filterAndPaginateClientes();
  }

  sort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filterAndPaginateClientes();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterAndPaginateClientes();
    }
  }

  // CRUD operations
  onAdd() {
    console.log('onAdd() called - Opening cliente form');
    this.selectedCliente = null;
    this.showClienteForm = true;
  }

  onEdit(cliente: Cliente) {
    this.selectedCliente = cliente;
    this.showClienteForm = true;
    this.showViewDialog = false;
  }

  onView(cliente: Cliente) {
    this.selectedCliente = cliente;
    this.showViewDialog = true;
  }

  onDelete(cliente: Cliente) {
    this.clienteToDelete = cliente;
    this.showDeleteDialog = true;
  }

  onRefresh() {
    console.log('Refreshing clientes data...');
    this.searchTerm = '';
    this.selectedTipoCliente = '';
    this.selectedTipoDocumento = '';
    this.currentPage = 1;
    this.loading = true;
    
    // Clear current data
    this.clientes = [];
    this.pagedClientes = [];
    
    // Reload data from API only
    this.loadTiposCliente();
    this.loadClientes();
  }

  onSaveCliente(clienteData: Partial<Cliente>) {
    this.isSubmittingForm = true;
    
    if (clienteData.id) {
      // Edit existing cliente
      this.clientesService.update(clienteData.id, clienteData).subscribe({
        next: () => {
          this.loadClientes();
          this.onCancelForm();
          this.isSubmittingForm = false;
        },
        error: (error: any) => {
          console.error('Error al actualizar cliente - API no disponible:', error);
          alert('No se pudo actualizar el cliente. Verifique la conexión con el servidor.');
          this.isSubmittingForm = false;
        }
      });
    } else {
      // Add new cliente
      this.clientesService.create(clienteData).subscribe({
        next: () => {
          this.loadClientes();
          this.onCancelForm();
          this.isSubmittingForm = false;
        },
        error: (error: any) => {
          console.error('Error al crear cliente - API no disponible:', error);
          alert('No se pudo crear el cliente. Verifique la conexión con el servidor.');
          this.isSubmittingForm = false;
        }
      });
    }
  }

  onCancelForm() {
    this.showClienteForm = false;
    this.selectedCliente = null;
    this.isSubmittingForm = false;
  }

  confirmDelete() {
    if (this.clienteToDelete) {
      this.clientesService.delete(this.clienteToDelete.id).subscribe({
        next: () => {
          this.loadClientes();
          this.cancelDelete();
        },
        error: (error: any) => {
          console.error('Error al eliminar cliente - API no disponible:', error);
          alert('No se pudo eliminar el cliente. Verifique la conexión con el servidor.');
          this.cancelDelete();
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteDialog = false;
    this.clienteToDelete = null;
  }

  closeViewDialog() {
    this.showViewDialog = false;
    this.selectedCliente = null;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Utility methods
  getTipoClienteClass(tipoNombre: string): string {
    if (!tipoNombre) return 'tipo-default';
    return 'tipo-' + tipoNombre.toLowerCase().replace(/\s+/g, '-');
  }

  getTipoDocumentoClass(tipoDocumento: string): string {
    if (!tipoDocumento) return 'documento-default';
    return 'documento-' + tipoDocumento.toLowerCase().replace(/\s+/g, '-');
  }

  getMaxShown(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalClientes);
  }

  // TrackBy functions for performance
  trackByTipoClienteId(index: number, tipo: TipoCliente): number {
    return tipo.id;
  }

  trackByClienteId(index: number, cliente: Cliente): number {
    return cliente.id;
  }

  forceLoadMockData() {
    console.log('Forcing mock data load...');
    this.clientes = []; // Clear existing data
    this.pagedClientes = [];
    this.loading = true;
    this.loadMockClientes();
  }
}
