import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TiposVehiculoService } from '../services/tipos-vehiculo.service';
import { 
  TipoVehiculoDto, 
  TipoVehiculoStats, 
  TipoVehiculoCategoria,
  getCategoriaDisplay,
  getCategoriaColor,
  CreateTipoVehiculoRequest
} from '../models/tipos-vehiculo.models';

@Component({
  selector: 'app-tipos-vehiculo-list',
  template: `
    <div class="container">
      <h2>Gestión de Tipos de Vehículo</h2>
      
      <!-- Stats -->
      <div class="stats" *ngIf="stats">
        <div class="stat-card">
          <div class="value">{{ stats!.totalTipos }}</div>
          <div class="label">Total</div>
        </div>
        <div class="stat-card">
          <div class="value">{{ stats!.tiposActivos }}</div>
          <div class="label">Activos</div>
        </div>
        <div class="stat-card">
          <div class="value">{{ stats!.tiposInactivos }}</div>
          <div class="label">Inactivos</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <input type="text" 
               placeholder="Buscar..." 
               [(ngModel)]="searchTerm"
               (input)="onSearch()"
               class="search-input">
        <button (click)="openCreateModal()" class="btn-primary">
          + Nuevo Tipo
        </button>
      </div>

      <!-- Table -->
      <div class="table-container" *ngIf="!loading">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Ejes</th>
              <th>Tarifa</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tipo of filteredTipos">
              <td>{{ tipo.nombre }}</td>
              <td>{{ tipo.descripcion }}</td>
              <td>
                <span class="category-badge" 
                      [style.background-color]="getCategoriaColorLocal(tipo.categoria)">
                  {{ getCategoriaDisplayLocal(tipo.categoria) }}
                </span>
              </td>
              <td>{{ tipo.numeroEjes }}</td>
              <td>\${{ tipo.tarifaBase }}</td>
              <td>
                <span [class]="tipo.esActivo ? 'status-active' : 'status-inactive'">
                  {{ tipo.esActivo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <button (click)="editTipo(tipo)" class="btn-edit">Edit</button>
                <button (click)="deleteTipo(tipo)" class="btn-delete">Del</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="loading" class="loading">Cargando...</div>
    </div>

    <!-- Modal -->
    <div *ngIf="showModal" class="modal" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>{{ editingTipo ? 'Editar' : 'Crear' }} Tipo de Vehículo</h3>
        
        <div class="form-group">
          <label>Nombre:</label>
          <input [(ngModel)]="formData.nombre" type="text" required>
        </div>

        <div class="form-group">
          <label>Descripción:</label>
          <textarea [(ngModel)]="formData.descripcion" required></textarea>
        </div>

        <div class="form-group">
          <label>Categoría:</label>
          <select [(ngModel)]="formData.categoria" required>
            <option value="">Seleccionar...</option>
            <option value="LIVIANO">Liviano</option>
            <option value="PESADO">Pesado</option>
            <option value="ESPECIAL">Especial</option>
          </select>
        </div>

        <div class="form-group">
          <label>Número de Ejes:</label>
          <input [(ngModel)]="formData.numeroEjes" type="number" min="1" required>
        </div>

        <div class="form-group">
          <label>Tarifa Base:</label>
          <input [(ngModel)]="formData.tarifaBase" type="number" min="0" required>
        </div>

        <div class="form-actions">
          <button (click)="closeModal()" class="btn-secondary">Cancelar</button>
          <button (click)="saveTipo()" class="btn-primary" [disabled]="saving">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .stats { display: flex; gap: 20px; margin: 20px 0; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
    .value { font-size: 24px; font-weight: bold; color: #333; }
    .label { color: #666; margin-top: 5px; }
    .actions { display: flex; gap: 10px; margin: 20px 0; align-items: center; }
    .search-input { padding: 10px; border: 1px solid #ddd; border-radius: 4px; flex: 1; max-width: 300px; }
    .btn-primary { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    .btn-primary:hover { background: #0056b3; }
    .btn-primary:disabled { background: #ccc; cursor: not-allowed; }
    .table-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
    .category-badge { padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; }
    .status-active { color: #28a745; font-weight: 500; }
    .status-inactive { color: #dc3545; font-weight: 500; }
    .btn-edit, .btn-delete { padding: 4px 8px; margin: 0 2px; border: 1px solid #ddd; background: white; border-radius: 3px; cursor: pointer; font-size: 12px; }
    .btn-edit:hover { background: #e3f2fd; border-color: #2196f3; }
    .btn-delete:hover { background: #ffebee; border-color: #f44336; }
    .loading { text-align: center; padding: 40px; color: #666; }
    .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
    .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    .form-group textarea { resize: vertical; height: 80px; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 30px; }
    .btn-secondary { background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    .btn-secondary:hover { background: #545b62; }
  `]
})
export class TiposVehiculoListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  tiposVehiculo: TipoVehiculoDto[] = [];
  filteredTipos: TipoVehiculoDto[] = [];
  stats: TipoVehiculoStats | null = null;
  
  searchTerm = '';
  loading = false;
  saving = false;
  
  showModal = false;
  editingTipo: TipoVehiculoDto | null = null;
  formData: any = {};

  constructor(private tiposVehiculoService: TiposVehiculoService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    
    this.tiposVehiculoService.getTiposVehiculo()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tipos) => {
          this.tiposVehiculo = tipos;
          this.filteredTipos = tipos;
          this.loadStats();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading tipos vehiculo:', error);
          this.loading = false;
        }
      });
  }

  loadStats(): void {
    this.tiposVehiculoService.getEstadisticas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => this.stats = stats,
        error: (error) => console.error('Error loading stats:', error)
      });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredTipos = this.tiposVehiculo.filter(tipo =>
      tipo.nombre.toLowerCase().includes(term) ||
      tipo.descripcion.toLowerCase().includes(term)
    );
  }

  openCreateModal(): void {
    this.editingTipo = null;
    this.formData = {
      nombre: '',
      descripcion: '',
      categoria: '',
      numeroEjes: 2,
      tarifaBase: 0
    };
    this.showModal = true;
  }

  editTipo(tipo: TipoVehiculoDto): void {
    this.editingTipo = tipo;
    this.formData = { ...tipo };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingTipo = null;
    this.formData = {};
  }

  saveTipo(): void {
    this.saving = true;
    
    if (this.editingTipo) {
      this.tiposVehiculoService.updateTipoVehiculo(this.editingTipo.id, this.formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.saving = false;
            this.closeModal();
            this.loadData();
          },
          error: (error) => {
            console.error('Error updating:', error);
            this.saving = false;
          }
        });
    } else {
      this.tiposVehiculoService.createTipoVehiculo(this.formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.saving = false;
            this.closeModal();
            this.loadData();
          },
          error: (error) => {
            console.error('Error creating:', error);
            this.saving = false;
          }
        });
    }
  }

  deleteTipo(tipo: TipoVehiculoDto): void {
    if (confirm('¿Está seguro de eliminar el tipo de vehículo "' + tipo.nombre + '"?')) {
      this.tiposVehiculoService.deleteTipoVehiculo(tipo.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.loadData(),
          error: (error) => console.error('Error deleting:', error)
        });
    }
  }

  getCategoriaDisplayLocal(categoria: string): string {
    return getCategoriaDisplay(categoria as TipoVehiculoCategoria);
  }

  getCategoriaColorLocal(categoria: string): string {
    return getCategoriaColor(categoria as TipoVehiculoCategoria);
  }
}
