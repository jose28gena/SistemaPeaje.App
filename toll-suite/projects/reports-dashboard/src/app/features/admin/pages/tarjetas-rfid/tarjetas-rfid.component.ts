import { Component, OnInit } from '@angular/core';
import { TarjetasRfidService, ClientesService, TarjetaRfid, Cliente, PaginatedResponse } from '@toll-suite/data-access';

@Component({
  selector: 'app-tarjetas-rfid',
  template: `
    <div class="tarjetas-rfid-page">
      <div class="page-header">
        <div>
          <h1>Gestión de Tarjetas RFID</h1>
          <p>Administrar las tarjetas RFID del sistema de peaje</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="onRefresh()">
            <i class="fas fa-sync"></i>
            Actualizar
          </button>
          <button class="btn btn-primary" (click)="onAdd()">
            <i class="fas fa-plus"></i>
            Nueva Tarjeta
          </button>
        </div>
      </div>

      <div class="table-controls">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Buscar tarjetas..." 
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            class="search-input"
          >
          <i class="fas fa-search search-icon"></i>
        </div>
        <div class="filter-controls">
          <select [(ngModel)]="selectedEstado" (change)="onFilterByEstado()" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="Activa">Activa</option>
            <option value="Bloqueada">Bloqueada</option>
            <option value="Vencida">Vencida</option>
          </select>
          <select [(ngModel)]="selectedTipoCliente" (change)="onFilterByTipoCliente()" class="filter-select">
            <option value="">Todos los clientes</option>
            <option value="true">Residentes</option>
            <option value="false">No residentes</option>
          </select>
          <select [(ngModel)]="selectedSaldo" (change)="onFilterBySaldo()" class="filter-select">
            <option value="">Todos los saldos</option>
            <option value="bajo">Saldo bajo (< $10)</option>
            <option value="medio">Saldo medio ($10-$50)</option>
            <option value="alto">Saldo alto (> $50)</option>
          </select>
        </div>
      </div>

      <div class="table-container" *ngIf="!loading">
        <table class="data-table">
          <thead>
            <tr>
              <th (click)="sort('numeroTag')" class="sortable">
                Número Tag
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th (click)="sort('clienteNombre')" class="sortable">
                Cliente
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th (click)="sort('saldo')" class="sortable">
                Saldo
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th (click)="sort('estado')" class="sortable">
                Estado
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th>Tipo Cliente</th>
              <th (click)="sort('fechaEmision')" class="sortable">
                Fecha Emisión
                <i class="fas fa-sort sort-icon"></i>
              </th>
              <th>Fecha Vencimiento</th>
              <th>Transacciones</th>
              <th>Última Recarga</th>
              <th class="actions-column">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tarjeta of pagedTarjetas; trackBy: trackByTarjetaId" class="table-row">
              <td class="font-mono">{{ tarjeta.numeroTag }}</td>
              <td class="font-medium">{{ tarjeta.clienteNombre }}</td>
              <td class="text-right">
                <span class="saldo-badge" [class]="getSaldoClass(tarjeta.saldo)">
                  {{ formatCurrency(tarjeta.saldo) }}
                </span>
              </td>
              <td>
                <span class="estado-badge" [class]="getEstadoClass(tarjeta.estado)">
                  {{ tarjeta.estado }}
                </span>
              </td>
              <td>
                <span class="tipo-badge" [class]="getTipoClienteClass(tarjeta.esResidente || false)">
                  {{ tarjeta.esResidente ? 'Residente' : 'Regular' }}
                </span>
              </td>
              <td>{{ formatDate(tarjeta.fechaEmision) }}</td>
              <td>{{ formatDate(tarjeta.fechaVencimiento || '') }}</td>
              <td class="text-center">{{ tarjeta.transaccionesRealizadas }}</td>
              <td>{{ formatDate(tarjeta.ultimaRecarga || '') }}</td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button class="btn btn-sm btn-info" (click)="onView(tarjeta)" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-primary" (click)="onEdit(tarjeta)" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-success" (click)="onRecargar(tarjeta)" title="Recargar" *ngIf="tarjeta.estado === 'Activa'">
                    <i class="fas fa-plus-circle"></i>
                  </button>
                  <button class="btn btn-sm btn-warning" (click)="onBloquear(tarjeta)" title="Bloquear" *ngIf="tarjeta.estado === 'Activa'">
                    <i class="fas fa-lock"></i>
                  </button>
                  <button class="btn btn-sm btn-success" (click)="onActivar(tarjeta)" title="Activar" *ngIf="tarjeta.estado === 'Bloqueada'">
                    <i class="fas fa-unlock"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="onDelete(tarjeta)" title="Eliminar">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="table-info">
          <span>Mostrando {{ getStartIndex() + 1 }} a {{ getEndIndex() }} de {{ filteredTarjetas.length }} tarjetas</span>
          <div class="pagination-controls">
            <button class="btn btn-sm btn-outline-secondary" (click)="previousPage()" [disabled]="currentPage === 1">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="page-info">Página {{ currentPage }} de {{ getTotalPages() }}</span>
            <button class="btn btn-sm btn-outline-secondary" (click)="nextPage()" [disabled]="currentPage === getTotalPages()">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="loading-container" *ngIf="loading">
        <div class="spinner">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <p>Cargando tarjetas RFID...</p>
      </div>

      <div class="empty-state" *ngIf="!loading && filteredTarjetas.length === 0">
        <i class="fas fa-credit-card"></i>
        <h3>No hay tarjetas RFID</h3>
        <p>No se encontraron tarjetas que coincidan con los filtros aplicados</p>
        <button class="btn btn-primary" (click)="onAdd()">
          <i class="fas fa-plus"></i>
          Nueva Tarjeta
        </button>
      </div>
    </div>

    <!-- Modal para recargar tarjeta -->
    <div class="modal-overlay" *ngIf="showRecargarModal" (click)="closeRecargarModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Recargar Tarjeta</h2>
          <button class="btn btn-icon" (click)="closeRecargarModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Tarjeta: {{ selectedTarjeta?.numeroTag }}</label>
            <p class="help-text">Cliente: {{ selectedTarjeta?.clienteNombre }}</p>
            <p class="help-text">Saldo actual: {{ formatCurrency(selectedTarjeta?.saldo || 0) }}</p>
          </div>
          <div class="form-group">
            <label for="montoRecarga">Monto a recargar</label>
            <input 
              type="number" 
              id="montoRecarga" 
              [(ngModel)]="montoRecarga" 
              class="form-control"
              placeholder="0.00"
              min="1"
              step="0.01"
            >
          </div>
          <div class="form-group" *ngIf="montoRecarga > 0">
            <div class="recarga-summary">
              <div class="summary-row">
                <span>Saldo actual:</span>
                <span>{{ formatCurrency(selectedTarjeta?.saldo || 0) }}</span>
              </div>
              <div class="summary-row">
                <span>Monto a recargar:</span>
                <span>{{ formatCurrency(montoRecarga) }}</span>
              </div>
              <div class="summary-row total">
                <span>Nuevo saldo:</span>
                <span>{{ formatCurrency((selectedTarjeta?.saldo || 0) + montoRecarga) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeRecargarModal()">Cancelar</button>
          <button class="btn btn-primary" (click)="confirmarRecarga()" [disabled]="!montoRecarga || montoRecarga <= 0">
            Confirmar Recarga
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para bloquear/activar -->
    <div class="modal-overlay" *ngIf="showConfirmModal" (click)="closeConfirmModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ confirmAction === 'bloquear' ? 'Bloquear' : 'Activar' }} Tarjeta</h2>
          <button class="btn btn-icon" (click)="closeConfirmModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>¿Está seguro que desea {{ confirmAction === 'bloquear' ? 'bloquear' : 'activar' }} la tarjeta <strong>{{ selectedTarjeta?.numeroTag }}</strong>?</p>
          <p class="help-text">Cliente: {{ selectedTarjeta?.clienteNombre }}</p>
          <p class="help-text">Estado actual: {{ selectedTarjeta?.estado }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeConfirmModal()">Cancelar</button>
          <button class="btn" [class]="confirmAction === 'bloquear' ? 'btn-warning' : 'btn-success'" (click)="confirmarAccion()">
            {{ confirmAction === 'bloquear' ? 'Bloquear' : 'Activar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para formulario de tarjeta -->
    <div class="modal-overlay" *ngIf="showFormModal" (click)="closeFormModal()">
      <div class="modal-content form-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ formMode === 'create' ? 'Nueva Tarjeta RFID' : 'Editar Tarjeta RFID' }}</h2>
          <button class="btn btn-icon" (click)="closeFormModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <app-tarjeta-form 
            [tarjeta]="selectedTarjeta" 
            (save)="onSaveTarjeta($event)"
            (cancel)="closeFormModal()">
          </app-tarjeta-form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeFormModal()">Cancelar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tarjetas-rfid-page {
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
      gap: 1rem;
    }
    
    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .search-box {
      position: relative;
      flex: 1;
      max-width: 300px;
    }
    
    .search-input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      font-size: 0.9rem;
    }
    
    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
    }
    
    .filter-controls {
      display: flex;
      gap: 1rem;
    }
    
    .filter-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      font-size: 0.9rem;
      background: white;
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
    
    .data-table th,
    .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }
    
    .data-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
    }
    
    .table-row:hover {
      background: #f8f9fa;
    }
    
    .actions-column {
      width: 200px;
    }
    
    .actions-cell {
      width: 200px;
    }
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
    }
    
    .btn-icon {
      padding: 0.25rem;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-info {
      background: #17a2b8;
      color: white;
    }
    
    .btn-success {
      background: #28a745;
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
    
    .btn-outline-secondary {
      background: transparent;
      color: #6c757d;
      border: 1px solid #6c757d;
    }
    
    .btn:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    .font-mono {
      font-family: 'Courier New', monospace;
      font-weight: 600;
    }
    
    .font-medium {
      font-weight: 500;
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-center {
      text-align: center;
    }
    
    .saldo-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .saldo-bajo {
      background: #f8d7da;
      color: #721c24;
    }
    
    .saldo-medio {
      background: #fff3cd;
      color: #856404;
    }
    
    .saldo-alto {
      background: #d4edda;
      color: #155724;
    }
    
    .estado-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .estado-activa {
      background: #d4edda;
      color: #155724;
    }
    
    .estado-bloqueada {
      background: #f8d7da;
      color: #721c24;
    }
    
    .estado-vencida {
      background: #e2e3e5;
      color: #383d41;
    }
    
    .tipo-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .tipo-residente {
      background: #cce7ff;
      color: #0056b3;
    }
    
    .tipo-regular {
      background: #e9ecef;
      color: #495057;
    }
    
    .table-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      font-size: 0.9rem;
      color: #6c757d;
    }
    
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .page-info {
      margin: 0 0.5rem;
    }
    
    .loading-container {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .spinner {
      font-size: 2rem;
      color: #007bff;
      margin-bottom: 1rem;
    }
    
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .empty-state i {
      font-size: 4rem;
      color: #6c757d;
      margin-bottom: 1rem;
    }
    
    .empty-state h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
    }
    
    .empty-state p {
      margin: 0 0 2rem 0;
      color: #6c757d;
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
    }
    
    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #2c3e50;
    }
    
    .modal-body {
      padding: 1rem;
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1rem;
      border-top: 1px solid #e9ecef;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #495057;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      font-size: 0.9rem;
    }
    
    .help-text {
      margin: 0.25rem 0;
      font-size: 0.85rem;
      color: #6c757d;
    }
    
    .recarga-summary {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 1rem;
      border: 1px solid #e9ecef;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    
    .summary-row.total {
      border-top: 1px solid #dee2e6;
      padding-top: 0.5rem;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .summary-row:last-child {
      margin-bottom: 0;
    }
    
    .form-modal {
      max-width: 600px;
      width: 90%;
    }
    
    .form-modal .modal-body {
      padding: 0;
    }
  `]
})
export class TarjetasRfidComponent implements OnInit {
  tarjetas: TarjetaRfid[] = [];
  filteredTarjetas: TarjetaRfid[] = [];
  pagedTarjetas: TarjetaRfid[] = [];
  loading = false;
  
  // Filtros
  searchTerm = '';
  selectedEstado = '';
  selectedTipoCliente = '';
  selectedSaldo = '';
  
  // Paginación
  currentPage = 1;
  pageSize = 10;
  
  // Ordenamiento
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Modales
  showRecargarModal = false;
  showConfirmModal = false;
  showFormModal = false;
  selectedTarjeta: TarjetaRfid | null = null;
  confirmAction: 'bloquear' | 'activar' = 'bloquear';
  montoRecarga = 0;
  formMode: 'create' | 'edit' = 'create';

  constructor(
    private tarjetasService: TarjetasRfidService,
    private clientesService: ClientesService
  ) {}

  ngOnInit() {
    this.loadTarjetas();
  }

  loadTarjetas() {
    this.loading = true;
    this.tarjetasService.getAll().subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.tarjetas = response;
        } else {
          this.tarjetas = (response as PaginatedResponse<TarjetaRfid>).data || [];
        }
        this.applyFilters();
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading tarjetas:', error);
        this.loading = false;
        this.tarjetas = this.generateMockTarjetas();
        this.applyFilters();
      }
    });
  }

  generateMockTarjetas(): TarjetaRfid[] {
    const mockTarjetas: TarjetaRfid[] = [];
    
    for (let i = 1; i <= 25; i++) {
      const estados = ['Activa', 'Bloqueada', 'Vencida'];
      const tiposCliente = ['Regular', 'Residente', 'VIP'];
      const saldos = [5, 25, 75, 120, 200];
      
      mockTarjetas.push({
        id: i,
        numeroTag: `RF${String(i).padStart(8, '0')}`,
        clienteId: 1000 + i,
        saldo: saldos[i % saldos.length],
        estado: estados[i % estados.length],
        fechaEmision: new Date(2024, 0, i),
        fechaVencimiento: new Date(2025, 11, 31),
        clienteNombre: `Cliente ${i}`,
        tipoCliente: tiposCliente[i % tiposCliente.length],
        esResidente: i % 3 === 0,
        ultimaRecarga: i % 2 === 0 ? new Date(2024, 10, i) : undefined,
        transaccionesRealizadas: Math.floor(Math.random() * 100) + 1,
        fechaCreacion: new Date(2024, 0, i),
        fechaActualizacion: new Date(2024, 10, i),
        activo: true
      });
    }
    
    return mockTarjetas;
  }

  applyFilters() {
    this.filteredTarjetas = this.tarjetas.filter(tarjeta => {
      const matchesSearch = !this.searchTerm || 
        tarjeta.numeroTag?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        tarjeta.clienteNombre?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesEstado = !this.selectedEstado || tarjeta.estado === this.selectedEstado;
      
      const matchesTipoCliente = !this.selectedTipoCliente || 
        (this.selectedTipoCliente === 'true' && tarjeta.esResidente) ||
        (this.selectedTipoCliente === 'false' && !tarjeta.esResidente);
      
      const matchesSaldo = !this.selectedSaldo || this.checkSaldoFilter(tarjeta.saldo);
      
      return matchesSearch && matchesEstado && matchesTipoCliente && matchesSaldo;
    });
    
    this.sortTarjetas();
    this.updatePagination();
  }

  checkSaldoFilter(saldo: number): boolean {
    switch (this.selectedSaldo) {
      case 'bajo': return saldo < 10;
      case 'medio': return saldo >= 10 && saldo <= 50;
      case 'alto': return saldo > 50;
      default: return true;
    }
  }

  sortTarjetas() {
    if (!this.sortColumn) return;
    
    this.filteredTarjetas.sort((a, b) => {
      const aValue = this.getNestedProperty(a, this.sortColumn);
      const bValue = this.getNestedProperty(b, this.sortColumn);
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o && o[p], obj);
  }

  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedTarjetas = this.filteredTarjetas.slice(startIndex, endIndex);
  }

  onSearch() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterByEstado() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterByTipoCliente() {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterBySaldo() {
    this.currentPage = 1;
    this.applyFilters();
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortTarjetas();
    this.updatePagination();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredTarjetas.length / this.pageSize);
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  getEndIndex(): number {
    return Math.min(this.getStartIndex() + this.pageSize, this.filteredTarjetas.length);
  }

  onRefresh() {
    this.loadTarjetas();
  }

  onAdd() {
    this.selectedTarjeta = null;
    this.formMode = 'create';
    this.showFormModal = true;
  }

  onView(tarjeta: TarjetaRfid) {
    // TODO: Implementar vista de detalles
    console.log('Ver tarjeta:', tarjeta);
  }

  onEdit(tarjeta: TarjetaRfid) {
    this.selectedTarjeta = tarjeta;
    this.formMode = 'edit';
    this.showFormModal = true;
  }

  onRecargar(tarjeta: TarjetaRfid) {
    this.selectedTarjeta = tarjeta;
    this.montoRecarga = 0;
    this.showRecargarModal = true;
  }

  onBloquear(tarjeta: TarjetaRfid) {
    this.selectedTarjeta = tarjeta;
    this.confirmAction = 'bloquear';
    this.showConfirmModal = true;
  }

  onActivar(tarjeta: TarjetaRfid) {
    this.selectedTarjeta = tarjeta;
    this.confirmAction = 'activar';
    this.showConfirmModal = true;
  }

  closeRecargarModal() {
    this.showRecargarModal = false;
    this.selectedTarjeta = null;
    this.montoRecarga = 0;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.selectedTarjeta = null;
    this.confirmAction = 'bloquear';
  }

  confirmarRecarga() {
    if (!this.selectedTarjeta || this.montoRecarga <= 0) return;
    
    this.tarjetasService.recargarTarjeta(this.selectedTarjeta.id, { monto: this.montoRecarga }).subscribe({
      next: () => {
        console.log('Recarga exitosa');
        this.closeRecargarModal();
        this.loadTarjetas();
      },
      error: (error: Error) => {
        console.error('Error al recargar:', error);
        // Simular éxito para demo
        if (this.selectedTarjeta) {
          this.selectedTarjeta.saldo += this.montoRecarga;
          this.selectedTarjeta.ultimaRecarga = new Date();
        }
        this.closeRecargarModal();
      }
    });
  }

  confirmarAccion() {
    if (!this.selectedTarjeta) return;
    
    const serviceCall = this.confirmAction === 'bloquear' 
      ? this.tarjetasService.bloquearTarjeta(this.selectedTarjeta.id)
      : this.tarjetasService.activarTarjeta(this.selectedTarjeta.id);
    
    serviceCall.subscribe({
      next: () => {
        console.log(`${this.confirmAction} exitoso`);
        this.closeConfirmModal();
        this.loadTarjetas();
      },
      error: (error: Error) => {
        console.error(`Error al ${this.confirmAction}:`, error);
        // Simular éxito para demo
        if (this.selectedTarjeta) {
          this.selectedTarjeta.estado = this.confirmAction === 'bloquear' ? 'Bloqueada' : 'Activa';
        }
        this.closeConfirmModal();
      }
    });
  }

  getSaldoClass(saldo: number): string {
    if (saldo < 10) return 'saldo-bajo';
    if (saldo <= 50) return 'saldo-medio';
    return 'saldo-alto';
  }

  getEstadoClass(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'activa': return 'estado-activa';
      case 'bloqueada': return 'estado-bloqueada';
      case 'vencida': return 'estado-vencida';
      default: return 'estado-activa';
    }
  }

  getTipoClienteClass(esResidente: boolean): string {
    return esResidente ? 'tipo-residente' : 'tipo-regular';
  }

  // Form modal methods
  closeFormModal() {
    this.showFormModal = false;
    this.selectedTarjeta = null;
    this.formMode = 'create';
  }

  onSaveTarjeta(tarjeta: TarjetaRfid) {
    if (this.formMode === 'create') {
      this.createTarjeta(tarjeta);
    } else {
      this.updateTarjeta(tarjeta);
    }
  }

  createTarjeta(tarjeta: TarjetaRfid) {
    this.tarjetasService.create(tarjeta).subscribe({
      next: (response) => {
        console.log('Tarjeta creada:', response);
        this.loadTarjetas();
        this.closeFormModal();
      },
      error: (error: Error) => {
        console.error('Error creating tarjeta:', error);
        // Simulación de creación exitosa para demo
        const newTarjeta = {
          ...tarjeta,
          id: Math.max(...this.tarjetas.map(t => t.id || 0)) + 1,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          activo: true
        };
        this.tarjetas.unshift(newTarjeta);
        this.applyFilters();
        this.closeFormModal();
      }
    });
  }

  updateTarjeta(tarjeta: TarjetaRfid) {
    if (!tarjeta.id) return;
    
    this.tarjetasService.update(tarjeta.id, tarjeta).subscribe({
      next: (response) => {
        console.log('Tarjeta actualizada:', response);
        this.loadTarjetas();
        this.closeFormModal();
      },
      error: (error: Error) => {
        console.error('Error updating tarjeta:', error);
        // Simulación de actualización exitosa para demo
        const index = this.tarjetas.findIndex(t => t.id === tarjeta.id);
        if (index !== -1) {
          this.tarjetas[index] = {
            ...tarjeta,
            fechaActualizacion: new Date()
          };
          this.applyFilters();
          this.closeFormModal();
        }
      }
    });
  }

  onDelete(tarjeta: TarjetaRfid) {
    if (confirm(`¿Está seguro que desea eliminar la tarjeta ${tarjeta.numeroTag}?`)) {
      this.deleteTarjeta(tarjeta);
    }
  }

  deleteTarjeta(tarjeta: TarjetaRfid) {
    if (!tarjeta.id) return;
    
    this.tarjetasService.delete(tarjeta.id).subscribe({
      next: (response) => {
        console.log('Tarjeta eliminada:', response);
        this.loadTarjetas();
      },
      error: (error: Error) => {
        console.error('Error deleting tarjeta:', error);
        // Simulación de eliminación exitosa para demo
        this.tarjetas = this.tarjetas.filter(t => t.id !== tarjeta.id);
        this.applyFilters();
      }
    });
  }

  formatDate(date: Date | string | null): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  trackByTarjetaId(index: number, tarjeta: TarjetaRfid): number {
    return tarjeta.id;
  }
}
