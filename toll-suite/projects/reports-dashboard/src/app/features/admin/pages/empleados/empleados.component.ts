import { Component, OnInit } from '@angular/core';
import { EmpleadosService, EstacionesService, Empleado, Estacion, PaginatedResponse } from '@toll-suite/data-access';

@Component({
  selector: 'app-empleados',
  template: `
    <div class="empleados-page">
      <div class="page-header">
        <div>
          <h1>Gestión de Empleados</h1>
          <p>Administrar los empleados del sistema de peaje</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="onRefresh()">
            <i class="fas fa-sync"></i>
            Actualizar
          </button>
          <button class="btn btn-primary" (click)="onAdd()">
            <i class="fas fa-plus"></i>
            Nuevo Empleado
          </button>
        </div>
      </div>

      <div class="table-controls">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Buscar empleados..." 
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
          <select [(ngModel)]="selectedEstado" (change)="onFilterByEstado()" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Suspendido">Suspendido</option>
            <option value="Vacaciones">Vacaciones</option>
            <option value="Licencia Médica">Licencia Médica</option>
          </select>
        </div>
      </div>
      

      
      <div class="table-container" *ngIf="!loading">
        <table class="data-table">
          <thead>
            <tr>
              <th (click)="sort('cedula')" class="sortable">
                Cédula
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
              <th (click)="sort('puesto')" class="sortable">
                Puesto
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estación</th>
              <th (click)="sort('estado')" class="sortable">
                Estado
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th (click)="sort('fechaIngreso')" class="sortable">
                Fecha Ingreso
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th class="actions-column">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let empleado of pagedEmpleados; trackBy: trackByEmpleadoId" class="table-row">
              <td>{{ empleado.cedula }}</td>
              <td class="font-medium">{{ empleado.nombres }}</td>
              <td class="font-medium">{{ empleado.apellidos }}</td>
              <td>
                <span class="puesto-badge" [class]="getPuestoClass(empleado.puesto)" *ngIf="empleado.puesto">
                  {{ empleado.puesto }}
                </span>
                <span class="puesto-badge puesto-default" *ngIf="!empleado.puesto">
                  Sin asignar
                </span>
              </td>
              <td>{{ empleado.email }}</td>
              <td>{{ empleado.telefono }}</td>
              <td>{{ empleado.estacion?.nombre || 'Sin asignar' }}</td>
              <td>
                <span class="status-badge" [class]="getStatusClass(empleado.estado)" *ngIf="empleado.estado">
                  {{ empleado.estado }}
                </span>
                <span class="status-badge status-default" *ngIf="!empleado.estado">
                  Sin estado
                </span>
              </td>
              <td>{{ formatDate(empleado.fechaIngreso) }}</td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button 
                    class="btn-action btn-view" 
                    (click)="onView(empleado)"
                    title="Ver detalles"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    class="btn-action btn-edit" 
                    (click)="onEdit(empleado)"
                    title="Editar empleado"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    class="btn-action btn-delete" 
                    (click)="onDelete(empleado)"
                    title="Eliminar empleado"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="no-data" *ngIf="pagedEmpleados.length === 0 && !loading">
          <i class="fas fa-user-slash"></i>
          <h3>No hay empleados disponibles</h3>
          <p>No se pudieron cargar los empleados desde el servidor, o no hay empleados registrados en el sistema.</p>
          <div class="no-data-actions">
            <button class="btn btn-primary" (click)="onAdd()">
              <i class="fas fa-plus"></i>
              Agregar Empleado
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
            de {{ totalEmpleados }} empleados
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
        <p>Cargando empleados...</p>
      </div>
      
      <!-- Empleado Form Modal -->
      <app-empleado-form
        [isOpen]="showEmpleadoForm"
        [empleado]="selectedEmpleado"
        [isSubmitting]="isSubmittingForm"
        [estaciones]="estaciones"
        (save)="onSaveEmpleado($event)"
        (cancel)="onCancelForm()"
      ></app-empleado-form>

      <!-- Confirm Dialog -->
      <div class="modal-overlay" *ngIf="showDeleteDialog" (click)="cancelDelete()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Confirmar Eliminación</h3>
          </div>
          <div class="modal-body">
            <p>¿Está seguro que desea eliminar al empleado <strong>{{ empleadoToDelete?.nombres }} {{ empleadoToDelete?.apellidos }}</strong>?</p>
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

      <!-- View Employee Modal -->
      <div class="modal-overlay" *ngIf="showViewDialog" (click)="closeViewDialog()">
        <div class="modal-content view-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Detalles del Empleado</h3>
            <button class="btn-close" (click)="closeViewDialog()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body" *ngIf="selectedEmpleado">
            <div class="employee-details">
              <div class="detail-section">
                <h4><i class="fas fa-user"></i> Información Personal</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Cédula:</label>
                    <span>{{ selectedEmpleado!.cedula }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Nombres:</label>
                    <span>{{ selectedEmpleado!.nombres }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Apellidos:</label>
                    <span>{{ selectedEmpleado!.apellidos }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Email:</label>
                    <span>{{ selectedEmpleado!.email }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Teléfono:</label>
                    <span>{{ selectedEmpleado!.telefono }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Dirección:</label>
                    <span>{{ selectedEmpleado!.direccion }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Fecha de Nacimiento:</label>
                    <span>{{ formatDate(selectedEmpleado!.fechaNacimiento) }}</span>
                  </div>
                  <div class="detail-item" *ngIf="selectedEmpleado.numeroEmergencia">
                    <label>Contacto de Emergencia:</label>
                    <span>{{ selectedEmpleado.numeroEmergencia }}</span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4><i class="fas fa-briefcase"></i> Información Laboral</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Puesto:</label>
                    <span class="puesto-badge" [class]="getPuestoClass(selectedEmpleado.puesto)">
                      {{ selectedEmpleado.puesto }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <label>Fecha de Ingreso:</label>
                    <span>{{ formatDate(selectedEmpleado.fechaIngreso) }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Salario:</label>
                    <span>\${{ selectedEmpleado.salario.toFixed(2) }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Estación Asignada:</label>
                    <span>{{ selectedEmpleado.estacion?.nombre || 'Sin asignar' }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Estado:</label>
                    <span class="status-badge" [class]="getStatusClass(selectedEmpleado.estado)">
                      {{ selectedEmpleado.estado }}
                    </span>
                  </div>
                  <div class="detail-item" *ngIf="selectedEmpleado.observaciones">
                    <label>Observaciones:</label>
                    <span>{{ selectedEmpleado.observaciones }}</span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4><i class="fas fa-calendar"></i> Información del Sistema</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Fecha de Creación:</label>
                    <span>{{ formatDate(selectedEmpleado.fechaCreacion) }}</span>
                  </div>
                  <div class="detail-item" *ngIf="selectedEmpleado.fechaActualizacion">
                    <label>Última Actualización:</label>
                    <span>{{ formatDate(selectedEmpleado.fechaActualizacion) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeViewDialog()">
              Cerrar
            </button>
            <button type="button" class="btn btn-primary" (click)="onEdit(selectedEmpleado!)">
              <i class="fas fa-edit"></i>
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .empleados-page {
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
    
    .puesto-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }
    
    .puesto-operador-de-cabina {
      background: #e3f2fd;
      color: #1565c0;
    }
    
    .puesto-supervisor {
      background: #f3e5f5;
      color: #7b1fa2;
    }
    
    .puesto-administrador {
      background: #fff3e0;
      color: #ef6c00;
    }
    
    .puesto-tecnico-de-mantenimiento {
      background: #e8f5e8;
      color: #2e7d32;
    }
    
    .puesto-seguridad {
      background: #fce4ec;
      color: #c2185b;
    }
    
    .puesto-limpieza {
      background: #f1f8e9;
      color: #558b2f;
    }
    
    .puesto-contador {
      background: #e0f2f1;
      color: #00695c;
    }
    
    .puesto-gerente {
      background: #fff8e1;
      color: #f57f17;
    }
    
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }
    
    .status-activo {
      background: #d4edda;
      color: #155724;
    }
    
    .status-inactivo {
      background: #f8d7da;
      color: #721c24;
    }
    
    .status-suspendido {
      background: #fff3cd;
      color: #856404;
    }
    
    .status-vacaciones {
      background: #cce5ff;
      color: #004085;
    }
    
    .status-licencia-medica {
      background: #e2e3e5;
      color: #383d41;
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
    
    .btn-info {
      background: #17a2b8;
      color: white;
    }
    
    .btn-info:hover:not(:disabled) {
      background: #138496;
    }
    
    .btn-warning {
      background: #ffc107;
      color: #212529;
    }
    
    .btn-warning:hover:not(:disabled) {
      background: #e0a800;
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
    
    /* Employee Details Styles */
    .employee-details {
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
      .empleados-page {
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
export class EmpleadosComponent implements OnInit {
  // Data properties
  empleados: Empleado[] = [];
  estaciones: Estacion[] = [];
  pagedEmpleados: Empleado[] = [];
  
  // State properties
  loading = false;
  showEmpleadoForm = false;
  showDeleteDialog = false;
  showViewDialog = false;
  isSubmittingForm = false;
  
  // Selected items
  selectedEmpleado: Empleado | null = null;
  empleadoToDelete: Empleado | null = null;
  
  // Search and filter
  searchTerm = '';
  selectedEstacion = '';
  selectedEstado = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalEmpleados = 0;
  totalPages = 0;
  
  // Sorting
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private empleadosService: EmpleadosService,
    private estacionesService: EstacionesService
  ) {}

  ngOnInit() {
    console.log('EmpleadosComponent initialized');
    this.loading = true;
    
    // Load estaciones
    this.loadEstaciones();
    
    // Only try to load real data from API
    this.loadEmpleados();
  }

  loadEmpleados() {
    console.log('Attempting to load empleados from API...');
    
    this.empleadosService.getAll().subscribe({
      next: (response: PaginatedResponse<Empleado> | Empleado[]) => {
        console.log('API response for empleados:', response);
        
        // Handle both paginated and direct array responses
        let apiEmpleados: Empleado[] = [];
        if (Array.isArray(response)) {
          apiEmpleados = response;
        } else if (response && response.data) {
          apiEmpleados = response.data || [];
        }
        
        console.log('Loading API data:', apiEmpleados.length, 'records');
        this.empleados = apiEmpleados;
        this.totalEmpleados = apiEmpleados.length;
        this.filterAndPaginateEmpleados();
        this.loading = false;
      },
      error: (error: any) => {
        console.warn('API not available:', error);
        this.empleados = [];
        this.totalEmpleados = 0;
        this.loading = false;
        this.filterAndPaginateEmpleados();
      }
    });
  }

  loadEstaciones() {
    console.log('Loading estaciones...');
    this.estacionesService.getAll().subscribe({
      next: (response: PaginatedResponse<Estacion> | Estacion[]) => {
        console.log('Raw API response for estaciones:', response);
        
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
        
        console.log('Final estaciones array:', this.estaciones);
        console.log('Estaciones loaded successfully. Count:', this.estaciones.length);
        
        // Force change detection
        setTimeout(() => {
          console.log('Estaciones after timeout:', this.estaciones);
        }, 100);
      },
      error: (error: any) => {
        console.error('Error loading estaciones:', error);
        console.warn('Could not load estaciones, using mock data:', error);
        this.estaciones = this.getMockEstaciones();
        console.log('Using mock estaciones:', this.estaciones);
      }
    });
  }

  private loadMockEmpleados() {
    console.log('Loading mock empleados data...');
    
    // Mock data for demonstration
    this.empleados = [
      {
        id: 1,
        cedula: '1234567890',
        nombres: 'Juan Carlos',
        apellidos: 'Pérez González',
        email: 'juan.perez@tollsystem.com',
        telefono: '+593 99 123 4567',
        direccion: 'Av. Principal 123, Sector Norte',
        fechaNacimiento: new Date('1985-03-15'),
        fechaIngreso: new Date('2020-01-15'),
        puesto: 'Operador de Cabina',
        salario: 450.00,
        estacionId: 1,
        estacion: { id: 1, nombre: 'Estación Norte', ubicacion: 'Autopista Norte Km 15', activo: true, fechaCreacion: new Date() },
        estado: 'Activo',
        numeroEmergencia: '+593 99 876 5432',
        observaciones: 'Empleado modelo con excelente desempeño',
        activo: true,
        fechaCreacion: new Date('2020-01-15'),
        fechaActualizacion: new Date('2024-01-10')
      },
      {
        id: 2,
        cedula: '0987654321',
        nombres: 'María Elena',
        apellidos: 'Rodríguez Silva',
        email: 'maria.rodriguez@tollsystem.com',
        telefono: '+593 98 765 4321',
        direccion: 'Calle Secundaria 456, Centro',
        fechaNacimiento: new Date('1988-07-22'),
        fechaIngreso: new Date('2021-03-01'),
        puesto: 'Supervisor',
        salario: 650.00,
        estacionId: 1,
        estacion: { id: 1, nombre: 'Estación Norte', ubicacion: 'Autopista Norte Km 15', activo: true, fechaCreacion: new Date() },
        estado: 'Activo',
        numeroEmergencia: '+593 97 234 5678',
        observaciones: 'Supervisora con amplia experiencia',
        activo: true,
        fechaCreacion: new Date('2021-03-01'),
        fechaActualizacion: new Date('2024-02-15')
      },
      {
        id: 3,
        cedula: '1122334455',
        nombres: 'Roberto',
        apellidos: 'Mendoza Castro',
        email: 'roberto.mendoza@tollsystem.com',
        telefono: '+593 96 345 6789',
        direccion: 'Av. Los Pinos 789, Sur',
        fechaNacimiento: new Date('1990-11-08'),
        fechaIngreso: new Date('2022-06-15'),
        puesto: 'Técnico de Mantenimiento',
        salario: 500.00,
        estacionId: 2,
        estacion: { id: 2, nombre: 'Estación Sur', ubicacion: 'Autopista Sur Km 25', activo: true, fechaCreacion: new Date() },
        estado: 'Vacaciones',
        numeroEmergencia: '+593 95 456 7890',
        observaciones: 'Especialista en sistemas electrónicos',
        activo: true,
        fechaCreacion: new Date('2022-06-15'),
        fechaActualizacion: new Date('2024-03-20')
      },
      {
        id: 4,
        cedula: '5566778899',
        nombres: 'Ana Sofía',
        apellidos: 'Torres Vega',
        email: 'ana.torres@tollsystem.com',
        telefono: '+593 94 567 8901',
        direccion: 'Urbanización El Bosque, Casa 25',
        fechaNacimiento: new Date('1992-02-14'),
        fechaIngreso: new Date('2023-01-10'),
        puesto: 'Contador',
        salario: 750.00,
        estacionId: 3,
        estacion: { id: 3, nombre: 'Estación Central', ubicacion: 'Centro Financiero', activo: true, fechaCreacion: new Date() },
        estado: 'Activo',
        numeroEmergencia: '+593 93 678 9012',
        observaciones: 'CPA con especialización en auditoría',
        activo: true,
        fechaCreacion: new Date('2023-01-10'),
        fechaActualizacion: new Date('2024-04-05')
      },
      {
        id: 5,
        cedula: '6677889900',
        nombres: 'Luis Fernando',
        apellidos: 'Morales Herrera',
        email: 'luis.morales@tollsystem.com',
        telefono: '+593 92 789 0123',
        direccion: 'Sector La Colina, Mz 5 Casa 12',
        fechaNacimiento: new Date('1987-09-30'),
        fechaIngreso: new Date('2019-11-20'),
        puesto: 'Administrador',
        salario: 850.00,
        estacionId: 1,
        estacion: { id: 1, nombre: 'Estación Norte', ubicacion: 'Autopista Norte Km 15', activo: true, fechaCreacion: new Date() },
        estado: 'Activo',
        numeroEmergencia: '+593 91 890 1234',
        observaciones: 'Administrador general con 5 años de experiencia',
        activo: true,
        fechaCreacion: new Date('2019-11-20'),
        fechaActualizacion: new Date('2024-05-12')
      }
    ];
    
    this.totalEmpleados = this.empleados.length;
    this.loading = false;
    console.log('Mock empleados loaded successfully:', this.empleados.length, 'records');
    this.filterAndPaginateEmpleados();
  }

  private getMockEstaciones(): Estacion[] {
    return [
      { id: 1, nombre: 'Estación Norte', ubicacion: 'Autopista Norte Km 15', activo: true, fechaCreacion: new Date() },
      { id: 2, nombre: 'Estación Sur', ubicacion: 'Autopista Sur Km 25', activo: true, fechaCreacion: new Date() },
      { id: 3, nombre: 'Estación Este', ubicacion: 'Vía Este Km 10', activo: true, fechaCreacion: new Date() }
    ];
  }

  filterAndPaginateEmpleados() {
    let filteredEmpleados = [...this.empleados];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredEmpleados = filteredEmpleados.filter(empleado =>
        empleado.nombres.toLowerCase().includes(term) ||
        empleado.apellidos.toLowerCase().includes(term) ||
        empleado.cedula.includes(term) ||
        empleado.email.toLowerCase().includes(term) ||
        empleado.puesto.toLowerCase().includes(term)
      );
    }

    // Apply estacion filter
    if (this.selectedEstacion) {
      filteredEmpleados = filteredEmpleados.filter(empleado => 
        empleado.estacionId?.toString() === this.selectedEstacion
      );
    }

    // Apply estado filter
    if (this.selectedEstado) {
      filteredEmpleados = filteredEmpleados.filter(empleado => 
        empleado.estado === this.selectedEstado
      );
    }

    // Apply sorting
    if (this.sortField) {
      filteredEmpleados.sort((a, b) => {
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
    this.totalEmpleados = filteredEmpleados.length;
    this.totalPages = Math.ceil(this.totalEmpleados / this.pageSize);

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedEmpleados = filteredEmpleados.slice(startIndex, endIndex);

    // Adjust current page if necessary
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
      this.filterAndPaginateEmpleados();
    }
  }

  private getFieldValue(obj: any, field: string): any {
    return field.split('.').reduce((o, f) => o?.[f], obj) || '';
  }

  // Event handlers
  onSearch() {
    this.currentPage = 1;
    this.filterAndPaginateEmpleados();
  }

  onFilterByEstacion() {
    this.currentPage = 1;
    this.filterAndPaginateEmpleados();
  }

  onFilterByEstado() {
    this.currentPage = 1;
    this.filterAndPaginateEmpleados();
  }

  sort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filterAndPaginateEmpleados();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterAndPaginateEmpleados();
    }
  }

  // CRUD operations
  onAdd() {
    console.log('onAdd() called - Opening empleado form');
    console.log('Current state:', {
      showEmpleadoForm: this.showEmpleadoForm,
      selectedEmpleado: this.selectedEmpleado,
      estaciones: this.estaciones.length
    });
    
    this.selectedEmpleado = null;
    this.showEmpleadoForm = true;
    
    console.log('After setting showEmpleadoForm to true:', {
      showEmpleadoForm: this.showEmpleadoForm,
      selectedEmpleado: this.selectedEmpleado
    });
  }

  onEdit(empleado: Empleado) {
    this.selectedEmpleado = empleado;
    this.showEmpleadoForm = true;
    this.showViewDialog = false;
  }

  onView(empleado: Empleado) {
    this.selectedEmpleado = empleado;
    this.showViewDialog = true;
  }

  onDelete(empleado: Empleado) {
    this.empleadoToDelete = empleado;
    this.showDeleteDialog = true;
  }

  onRefresh() {
    console.log('Refreshing empleados data...');
    this.searchTerm = '';
    this.selectedEstacion = '';
    this.selectedEstado = '';
    this.currentPage = 1;
    this.loading = true;
    
    // Clear current data
    this.empleados = [];
    this.pagedEmpleados = [];
    
    // Reload data from API only
    this.loadEstaciones();
    this.loadEmpleados();
  }

  onSaveEmpleado(empleadoData: Partial<Empleado>) {
    this.isSubmittingForm = true;
    
    if (empleadoData.id) {
      // Edit existing empleado
      this.empleadosService.update(empleadoData.id, empleadoData).subscribe({
        next: () => {
          this.loadEmpleados();
          this.onCancelForm();
          this.isSubmittingForm = false;
        },
        error: (error: any) => {
          console.error('Error al actualizar empleado - API no disponible:', error);
          alert('No se pudo actualizar el empleado. Verifique la conexión con el servidor.');
          this.isSubmittingForm = false;
        }
      });
    } else {
      // Add new empleado
      this.empleadosService.create(empleadoData).subscribe({
        next: () => {
          this.loadEmpleados();
          this.onCancelForm();
          this.isSubmittingForm = false;
        },
        error: (error: any) => {
          console.error('Error al crear empleado - API no disponible:', error);
          alert('No se pudo crear el empleado. Verifique la conexión con el servidor.');
          this.isSubmittingForm = false;
        }
      });
    }
  }

  private updateMockEmpleado(empleadoData: Partial<Empleado>) {
    const index = this.empleados.findIndex(e => e.id === empleadoData.id);
    if (index !== -1) {
      this.empleados[index] = { 
        ...this.empleados[index], 
        ...empleadoData,
        fechaActualizacion: new Date()
      };
      
      // Update estacion reference if needed
      if (empleadoData.estacionId) {
        const estacion = this.estaciones.find(e => e.id === empleadoData.estacionId);
        if (estacion) {
          this.empleados[index].estacion = estacion;
        }
      }
      
      this.filterAndPaginateEmpleados();
      this.onCancelForm();
    }
  }

  private addMockEmpleado(empleadoData: Partial<Empleado>) {
    const newEmpleado: Empleado = {
      id: Math.max(...this.empleados.map(e => e.id)) + 1,
      cedula: empleadoData.cedula || '',
      nombres: empleadoData.nombres || '',
      apellidos: empleadoData.apellidos || '',
      email: empleadoData.email || '',
      telefono: empleadoData.telefono || '',
      direccion: empleadoData.direccion || '',
      fechaNacimiento: empleadoData.fechaNacimiento || new Date(),
      fechaIngreso: empleadoData.fechaIngreso || new Date(),
      puesto: empleadoData.puesto || '',
      salario: empleadoData.salario || 0,
      estacionId: empleadoData.estacionId || undefined,
      estado: empleadoData.estado || 'Activo',
      numeroEmergencia: empleadoData.numeroEmergencia || undefined,
      observaciones: empleadoData.observaciones || undefined,
      activo: empleadoData.activo !== false,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };

    // Add estacion reference if needed
    if (newEmpleado.estacionId) {
      const estacion = this.estaciones.find(e => e.id === newEmpleado.estacionId);
      if (estacion) {
        newEmpleado.estacion = estacion;
      }
    }

    this.empleados.unshift(newEmpleado);
    this.filterAndPaginateEmpleados();
    this.onCancelForm();
  }

  onCancelForm() {
    this.showEmpleadoForm = false;
    this.selectedEmpleado = null;
    this.isSubmittingForm = false;
  }

  confirmDelete() {
    if (this.empleadoToDelete) {
      this.empleadosService.delete(this.empleadoToDelete.id).subscribe({
        next: () => {
          this.loadEmpleados();
          this.cancelDelete();
        },
        error: (error: any) => {
          console.error('Error al eliminar empleado - API no disponible:', error);
          alert('No se pudo eliminar el empleado. Verifique la conexión con el servidor.');
          this.cancelDelete();
        }
      });
    }
  }

  private deleteMockEmpleado(id: number) {
    this.empleados = this.empleados.filter(e => e.id !== id);
    this.filterAndPaginateEmpleados();
    this.cancelDelete();
  }

  cancelDelete() {
    this.showDeleteDialog = false;
    this.empleadoToDelete = null;
  }

  closeViewDialog() {
    this.showViewDialog = false;
    this.selectedEmpleado = null;
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Utility methods
  getPuestoClass(puesto: string): string {
    if (!puesto) return 'puesto-default';
    return 'puesto-' + puesto.toLowerCase().replace(/\s+/g, '-');
  }

  getStatusClass(estado: string): string {
    if (!estado) return 'status-default';
    return 'status-' + estado.toLowerCase().replace(/\s+/g, '-');
  }

  getMaxShown(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalEmpleados);
  }

  // Debug methods
  debugEstaciones() {
    console.log('Debug - Estaciones:', this.estaciones);
    console.log('Debug - Estaciones length:', this.estaciones.length);
    console.log('Debug - Selected estacion:', this.selectedEstacion);
    
    // Test direct API call
    this.testEstacionesAPI();
  }

  testEstacionesAPI() {
    console.log('Testing direct API call...');
    this.estacionesService.getAll().subscribe({
      next: (response) => {
        console.log('Direct API test successful:', response);
      },
      error: (error) => {
        console.error('Direct API test failed:', error);
      }
    });
  }

  forceLoadEstaciones() {
    console.log('Force loading estaciones...');
    this.estaciones = []; // Clear current data
    this.loadEstaciones();
  }

  // TrackBy functions for performance
  trackByEstacionId(index: number, estacion: Estacion): number {
    return estacion.id;
  }

  trackByEmpleadoId(index: number, empleado: Empleado): number {
    return empleado.id;
  }

  // Debug methods
  debugData() {
    console.log('=== EMPLEADOS DEBUG DATA ===');
    console.log('empleados array:', this.empleados);
    console.log('pagedEmpleados array:', this.pagedEmpleados);
    console.log('estaciones array:', this.estaciones);
    console.log('loading:', this.loading);
    console.log('currentPage:', this.currentPage);
    console.log('totalPages:', this.totalPages);
    console.log('pageSize:', this.pageSize);
    console.log('totalEmpleados:', this.totalEmpleados);
    console.log('searchTerm:', this.searchTerm);
    console.log('selectedEstacion:', this.selectedEstacion);
    console.log('selectedEstado:', this.selectedEstado);
  }

  forceLoadMockData() {
    console.log('Forcing mock data load...');
    this.empleados = []; // Clear existing data
    this.pagedEmpleados = [];
    this.loading = true;
    this.loadMockEmpleados();
  }

  debugEmpleados() {
    console.log('Debug - Empleados:', this.empleados);
    console.log('Debug - Empleados length:', this.empleados.length);
    console.log('Debug - Paged empleados:', this.pagedEmpleados);
  }
}
