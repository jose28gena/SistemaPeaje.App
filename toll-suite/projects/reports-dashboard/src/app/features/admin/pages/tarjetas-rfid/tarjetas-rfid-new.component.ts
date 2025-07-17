import { Component, OnInit } from '@angular/core';
import { TarjetasRfidService, ClientesService, TarjetaRfid, Cliente, PaginatedResponse } from '@toll-suite/data-access';

@Component({
  selector: 'rd-tarjetas-rfid-new',
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
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Número de Tag</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Saldo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tarjeta of paginatedTarjetas; trackBy: trackByTarjetaId">
              <td>{{ tarjeta.id }}</td>
              <td>{{ tarjeta.numeroTag }}</td>
              <td>{{ getClienteName(tarjeta.clienteId) }}</td>
              <td>
                <span class="status-badge" [class]="getStatusClass(tarjeta.estado)">
                  {{ tarjeta.estado }}
                </span>
              </td>
              <td>{{ formatCurrency(tarjeta.saldo) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-info" (click)="onView(tarjeta)" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-warning" (click)="onEdit(tarjeta)" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="onDelete(tarjeta)" title="Eliminar">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="paginatedTarjetas.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-credit-card"></i>
          </div>
          <h3>No hay tarjetas RFID</h3>
          <p>{{ isLoading ? 'Cargando tarjetas...' : 'No se encontraron tarjetas RFID que coincidan con los criterios de búsqueda.' }}</p>
          <button *ngIf="!isLoading" class="btn btn-primary" (click)="onAdd()">
            <i class="fas fa-plus"></i>
            Crear primera tarjeta
          </button>
        </div>
      </div>

      <div class="pagination" *ngIf="paginatedTarjetas.length > 0">
        <div class="pagination-info">
          Mostrando {{ (currentPage - 1) * pageSize + 1 }} - {{ getEndIndex() }} de {{ totalItems }} tarjetas
        </div>
        <div class="pagination-controls">
          <button class="btn btn-sm btn-secondary" (click)="onPageChange(currentPage - 1)" [disabled]="currentPage === 1">
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button class="btn btn-sm btn-secondary" (click)="onPageChange(currentPage + 1)" [disabled]="currentPage === totalPages">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tarjetas-rfid-page {
      padding: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }

    .page-header h1 {
      color: #333;
      margin: 0;
      font-size: 28px;
    }

    .page-header p {
      color: #666;
      margin: 5px 0 0 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }

    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 20px;
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 400px;
    }

    .search-input {
      width: 100%;
      padding: 10px 40px 10px 12px;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .search-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
    }

    .filter-controls {
      display: flex;
      gap: 12px;
    }

    .filter-select {
      padding: 8px 12px;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      background-color: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #dee2e6;
    }

    .data-table td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }

    .data-table tr:hover {
      background-color: #f8f9fa;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-badge.activa {
      background-color: #d4edda;
      color: #155724;
    }

    .status-badge.bloqueada {
      background-color: #f8d7da;
      color: #721c24;
    }

    .status-badge.vencida {
      background-color: #fff3cd;
      color: #856404;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .btn-sm {
      padding: 4px 8px;
      font-size: 12px;
    }

    .btn-info {
      background-color: #17a2b8;
      color: white;
    }

    .btn-warning {
      background-color: #ffc107;
      color: #212529;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 20px;
      color: #ccc;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .page-info {
      padding: 0 12px;
      font-weight: 500;
    }
  `]
})
export class TarjetasRfidNewComponent implements OnInit {
  // Data properties
  tarjetas: TarjetaRfid[] = [];
  clientes: Cliente[] = [];
  paginatedTarjetas: TarjetaRfid[] = [];
  filteredTarjetas: TarjetaRfid[] = [];
  
  // State properties
  isLoading = false;
  error: string | null = null;
  
  // Form properties
  selectedTarjeta: TarjetaRfid | null = null;
  
  // Search and filter properties
  searchTerm = '';
  selectedEstado = '';
  
  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Mock data - replace with actual service calls
  private mockTarjetas: TarjetaRfid[] = [
    {
      id: 1,
      numeroTag: 'RFID001',
      clienteId: 1,
      estado: 'Activa',
      saldo: 25.50,
      fechaCreacion: new Date('2024-01-15'),
      fechaVencimiento: new Date('2024-12-31'),
      fechaActualizacion: new Date('2024-01-15'),
      fechaEmision: new Date('2024-01-15'),
      activo: true
    },
    {
      id: 2,
      numeroTag: 'RFID002',
      clienteId: 2,
      estado: 'Bloqueada',
      saldo: 0.00,
      fechaCreacion: new Date('2024-01-20'),
      fechaVencimiento: new Date('2024-12-31'),
      fechaActualizacion: new Date('2024-01-20'),
      fechaEmision: new Date('2024-01-20'),
      activo: false
    },
    {
      id: 3,
      numeroTag: 'RFID003',
      clienteId: 3,
      estado: 'Activa',
      saldo: 15.75,
      fechaCreacion: new Date('2024-02-01'),
      fechaVencimiento: new Date('2024-12-31'),
      fechaActualizacion: new Date('2024-02-01'),
      fechaEmision: new Date('2024-02-01'),
      activo: true
    }
  ];

  private mockClientes: Cliente[] = [
    {
      id: 1,
      numeroDocumento: '12345678',
      tipoDocumento: 'CC',
      nombres: 'Juan',
      apellidos: 'Pérez',
      email: 'juan.perez@email.com',
      telefono: '123-456-7890',
      direccion: 'Calle 123 #45-67',
      fechaNacimiento: new Date('1990-01-01'),
      fechaCreacion: new Date('2024-01-01'),
      fechaActualizacion: new Date('2024-01-01'),
      activo: true
    },
    {
      id: 2,
      numeroDocumento: '87654321',
      tipoDocumento: 'CC',
      nombres: 'María',
      apellidos: 'González',
      email: 'maria.gonzalez@email.com',
      telefono: '098-765-4321',
      direccion: 'Carrera 456 #78-90',
      fechaNacimiento: new Date('1985-05-15'),
      fechaCreacion: new Date('2024-01-02'),
      fechaActualizacion: new Date('2024-01-02'),
      activo: true
    },
    {
      id: 3,
      numeroDocumento: '11223344',
      tipoDocumento: 'CC',
      nombres: 'Carlos',
      apellidos: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      telefono: '555-123-4567',
      direccion: 'Avenida 789 #12-34',
      fechaNacimiento: new Date('1992-08-20'),
      fechaCreacion: new Date('2024-01-03'),
      fechaActualizacion: new Date('2024-01-03'),
      activo: true
    }
  ];

  constructor(
    private tarjetasRfidService: TarjetasRfidService,
    private clientesService: ClientesService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.error = null;

    // Using mock data for now
    setTimeout(() => {
      this.tarjetas = [...this.mockTarjetas];
      this.clientes = [...this.mockClientes];
      this.applyFilters();
      this.isLoading = false;
    }, 500);
  }

  applyFilters() {
    this.filteredTarjetas = this.tarjetas.filter(tarjeta => {
      const matchesSearch = !this.searchTerm || 
        tarjeta.numeroTag.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getClienteName(tarjeta.clienteId).toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesEstado = !this.selectedEstado || tarjeta.estado === this.selectedEstado;

      return matchesSearch && matchesEstado;
    });

    this.totalItems = this.filteredTarjetas.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedTarjetas();
  }

  updatePaginatedTarjetas() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTarjetas = this.filteredTarjetas.slice(startIndex, endIndex);
  }

  onSearch() {
    this.applyFilters();
  }

  onFilterByEstado() {
    this.applyFilters();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedTarjetas();
    }
  }

  onRefresh() {
    this.loadData();
  }

  onAdd() {
    console.log('Add new tarjeta');
    // TODO: Implement add functionality
  }

  onView(tarjeta: TarjetaRfid) {
    console.log('View tarjeta:', tarjeta);
    // TODO: Implement view functionality
  }

  onEdit(tarjeta: TarjetaRfid) {
    console.log('Edit tarjeta:', tarjeta);
    // TODO: Implement edit functionality
  }

  onDelete(tarjeta: TarjetaRfid) {
    console.log('Delete tarjeta:', tarjeta);
    // TODO: Implement delete functionality
  }

  getClienteName(clienteId: number): string {
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? `${cliente.nombres} ${cliente.apellidos}` : 'Cliente no encontrado';
  }

  getStatusClass(estado: string): string {
    return estado.toLowerCase().replace(' ', '-');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  trackByTarjetaId(index: number, tarjeta: TarjetaRfid): number {
    return tarjeta.id;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }
}
