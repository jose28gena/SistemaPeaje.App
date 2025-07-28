import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TiposVehiculoService } from '../services/tipos-vehiculo.service';
import { 
  TipoVehiculoDto, 
  CreateTipoVehiculoRequest, 
  UpdateTipoVehiculoRequest,
  CatalogoTipoVehiculoDto,
  TipoVehiculoFormData,
  CATEGORIAS_VEHICULO,
  ICONOS_CATEGORIA,
  TipoVehiculoCategoria
} from '../models/tipos-vehiculo.models';

@Component({
  selector: 'app-tipos-vehiculo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="tipos-vehiculo-container">
      <div class="header">
        <h2>
          <i class="fas fa-car"></i>
          Gestión de Tipos de Vehículo
        </h2>
        <div class="header-actions">
          <button 
            class="btn btn-secondary" 
            (click)="mostrarCatalogo = !mostrarCatalogo"
            type="button">
            <i class="fas fa-book"></i>
            {{ mostrarCatalogo ? 'Ocultar' : 'Ver' }} Catálogo
          </button>
          <button 
            class="btn btn-primary" 
            (click)="abrirFormulario()"
            type="button">
            <i class="fas fa-plus"></i>
            Nuevo Tipo
          </button>
        </div>
      </div>

      <!-- Catálogo de referencia -->
      <div class="catalogo-section" *ngIf="mostrarCatalogo">
        <h3><i class="fas fa-list"></i> Catálogo Maestro</h3>
        <div class="catalogo-grid" *ngIf="catalogoTipos().length > 0">
          <div 
            class="catalogo-card" 
            *ngFor="let catalogo of catalogoTipos()"
            (click)="crearDesdeCatalogo(catalogo)">
            <div class="catalogo-header">
              <span class="icono">{{ obtenerIconoCategoria(catalogo.categoria) }}</span>
              <h4>{{ catalogo.nombre }}</h4>
            </div>
            <p class="descripcion">{{ catalogo.descripcion }}</p>
            <div class="catalogo-details">
              <span class="categoria">{{ obtenerCategoriaDisplay(catalogo.categoria) }}</span>
              <span class="ejes">{{ catalogo.numeroEjes }} ejes</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de tipos -->
      <div class="tipos-section">
        <div class="section-header">
          <h3><i class="fas fa-table"></i> Tipos Configurados</h3>
          <div class="filters">
            <label>
              <input 
                type="checkbox" 
                [(ngModel)]="mostrarSoloActivos"
                (change)="cargarTipos()">
              Solo activos
            </label>
          </div>
        </div>

        <div class="loading" *ngIf="cargando()">
          <i class="fas fa-spinner fa-spin"></i>
          Cargando tipos de vehículo...
        </div>

        <div class="error-message" *ngIf="error()">
          <i class="fas fa-exclamation-triangle"></i>
          {{ error() }}
          <button class="btn btn-sm btn-secondary" (click)="cargarTipos()">
            <i class="fas fa-redo"></i>
            Reintentar
          </button>
        </div>

        <div class="tipos-grid" *ngIf="tiposFiltrados().length > 0">
          <div 
            class="tipo-card" 
            *ngFor="let tipo of tiposFiltrados()"
            [class.inactivo]="!tipo.esActivo">
            <div class="card-header">
              <div class="tipo-info">
                <span class="icono">{{ obtenerIconoCategoria(tipo.categoria) }}</span>
                <div>
                  <h4>{{ tipo.nombre }}</h4>
                  <p class="descripcion">{{ tipo.descripcion }}</p>
                </div>
              </div>
              <div class="estado">
                <span 
                  class="estado-badge" 
                  [class.activo]="tipo.esActivo"
                  [class.inactivo]="!tipo.esActivo">
                  {{ tipo.esActivo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>

            <div class="card-body">
              <div class="detalles">
                <div class="detalle">
                  <label>Categoría:</label>
                  <span class="categoria">{{ obtenerCategoriaDisplay(tipo.categoria) }}</span>
                </div>
                <div class="detalle">
                  <label>Ejes:</label>
                  <span>{{ tipo.numeroEjes }}</span>
                </div>
                <div class="detalle">
                  <label>Tarifa Base:</label>
                  <span class="tarifa">\${{ tipo.tarifaBase | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <button 
                class="btn btn-sm btn-secondary" 
                (click)="editarTipo(tipo)"
                title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="btn btn-sm btn-warning" 
                (click)="toggleActivo(tipo)"
                [title]="tipo.esActivo ? 'Desactivar' : 'Activar'">
                <i class="fas" [class.fa-pause]="tipo.esActivo" [class.fa-play]="!tipo.esActivo"></i>
              </button>
              <button 
                class="btn btn-sm btn-danger" 
                (click)="eliminarTipo(tipo)"
                title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="!cargando() && tiposFiltrados().length === 0">
          <i class="fas fa-car fa-3x"></i>
          <h3>No hay tipos de vehículo</h3>
          <p>{{ mostrarSoloActivos ? 'No hay tipos activos configurados' : 'Aún no has creado ningún tipo de vehículo' }}</p>
          <button class="btn btn-primary" (click)="abrirFormulario()">
            <i class="fas fa-plus"></i>
            Crear Tipo de Vehículo
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de formulario -->
    <div class="modal" *ngIf="mostrandoFormulario" (click)="cerrarFormulario($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>
            <i class="fas fa-car"></i>
            {{ tipoEnEdicion ? 'Editar' : 'Nuevo' }} Tipo de Vehículo
          </h3>
          <button class="btn-close" (click)="cerrarFormulario()" type="button">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form [formGroup]="formulario" (ngSubmit)="guardarTipo()" class="modal-body">
          <div class="form-group">
            <label for="nombre">Nombre *</label>
            <input 
              id="nombre"
              type="text" 
              class="form-control"
              formControlName="nombre"
              placeholder="Ej: Auto, Camión, etc.">
            <div class="error" *ngIf="formulario.get('nombre')?.invalid && formulario.get('nombre')?.touched">
              El nombre es requerido
            </div>
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción *</label>
            <textarea 
              id="descripcion"
              class="form-control"
              formControlName="descripcion"
              rows="3"
              placeholder="Descripción detallada del tipo de vehículo"></textarea>
            <div class="error" *ngIf="formulario.get('descripcion')?.invalid && formulario.get('descripcion')?.touched">
              La descripción es requerida
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="categoria">Categoría *</label>
              <select 
                id="categoria"
                class="form-control"
                formControlName="categoria">
                <option value="">Seleccionar categoría</option>
                <option *ngFor="let categoria of categoriasDisponibles" [value]="categoria.key">
                  {{ categoria.icono }} {{ categoria.value }}
                </option>
              </select>
              <div class="error" *ngIf="formulario.get('categoria')?.invalid && formulario.get('categoria')?.touched">
                La categoría es requerida
              </div>
            </div>

            <div class="form-group">
              <label for="numeroEjes">Número de Ejes *</label>
              <input 
                id="numeroEjes"
                type="number" 
                class="form-control"
                formControlName="numeroEjes"
                min="1"
                max="10">
              <div class="error" *ngIf="formulario.get('numeroEjes')?.invalid && formulario.get('numeroEjes')?.touched">
                <span *ngIf="formulario.get('numeroEjes')?.errors?.['required']">El número de ejes es requerido</span>
                <span *ngIf="formulario.get('numeroEjes')?.errors?.['min']">Debe ser mayor a 0</span>
                <span *ngIf="formulario.get('numeroEjes')?.errors?.['max']">Debe ser menor a 11</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="tarifaBase">Tarifa Base *</label>
            <div class="input-group">
              <span class="input-group-text">$</span>
              <input 
                id="tarifaBase"
                type="number" 
                class="form-control"
                formControlName="tarifaBase"
                min="0"
                step="0.01"
                placeholder="0.00">
            </div>
            <div class="error" *ngIf="formulario.get('tarifaBase')?.invalid && formulario.get('tarifaBase')?.touched">
              <span *ngIf="formulario.get('tarifaBase')?.errors?.['required']">La tarifa base es requerida</span>
              <span *ngIf="formulario.get('tarifaBase')?.errors?.['min']">La tarifa debe ser mayor o igual a 0</span>
            </div>
          </div>

          <div class="form-group" *ngIf="tipoEnEdicion">
            <label>
              <input 
                type="checkbox" 
                formControlName="esActivo">
              Tipo activo
            </label>
            <small class="form-text">Los tipos inactivos no aparecerán en los formularios de transacciones</small>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="cerrarFormulario()">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="formulario.invalid || guardando()">
              <i class="fas" [class.fa-save]="!guardando()" [class.fa-spinner]="guardando()" [class.fa-spin]="guardando()"></i>
              {{ guardando() ? 'Guardando...' : (tipoEnEdicion ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .tipos-vehiculo-container {
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .header h2 {
      margin: 0;
      color: #333;
    }
    
    .header-actions {
      display: flex;
      gap: 10px;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-danger {
      background-color: #dc3545;
      color: white;
    }
    
    .btn-warning {
      background-color: #ffc107;
      color: #212529;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .catalogo-section, .tipos-section {
      margin-bottom: 30px;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .catalogo-grid, .tipos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .catalogo-card, .tipo-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .catalogo-card {
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .catalogo-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .icono {
      font-size: 1.5em;
      margin-right: 8px;
    }
    
    .estado-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: bold;
    }
    
    .estado-badge.activo {
      background-color: #d4edda;
      color: #155724;
    }
    
    .estado-badge.inactivo {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #ddd;
    }
    
    .modal-body {
      padding: 20px;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    
    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .error {
      color: #dc3545;
      font-size: 0.8em;
      margin-top: 5px;
    }
    
    .loading, .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    
    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
  `]
})
export class TiposVehiculoListComponent implements OnInit {
  // Signals para el estado
  tipos = signal<TipoVehiculoDto[]>([]);
  catalogoTipos = signal<CatalogoTipoVehiculoDto[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);

  // Configuración de filtros y UI
  mostrarSoloActivos = false;
  mostrarCatalogo = false;
  mostrandoFormulario = false;
  tipoEnEdicion: TipoVehiculoDto | null = null;

  // Formulario reactivo
  formulario: FormGroup;

  // Constantes para el template
  CATEGORIAS_VEHICULO = CATEGORIAS_VEHICULO;

  // Computed properties
  tiposFiltrados = computed(() => {
    const todosTipos = this.tipos();
    if (this.mostrarSoloActivos) {
      return todosTipos.filter(tipo => tipo.esActivo);
    }
    return todosTipos;
  });

  categoriasDisponibles = Object.entries(CATEGORIAS_VEHICULO).map(([key, value]) => ({
    key: key as TipoVehiculoCategoria,
    value,
    icono: ICONOS_CATEGORIA[key as TipoVehiculoCategoria]
  }));

  constructor(
    private tiposVehiculoService: TiposVehiculoService,
    private fb: FormBuilder
  ) {
    this.formulario = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarTipos();
    this.cargarCatalogo();
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      categoria: ['', Validators.required],
      numeroEjes: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      tarifaBase: [0, [Validators.required, Validators.min(0)]],
      esActivo: [true]
    });
  }

  cargarTipos(): void {
    this.cargando.set(true);
    this.error.set(null);

    const observable = this.mostrarSoloActivos 
      ? this.tiposVehiculoService.getTiposVehiculoActivos()
      : this.tiposVehiculoService.getTiposVehiculo();

    observable.subscribe({
      next: (tipos) => {
        this.tipos.set(tipos);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar tipos de vehículo:', error);
        this.error.set('Error al cargar los tipos de vehículo. Por favor, inténtalo de nuevo.');
        this.cargando.set(false);
      }
    });
  }

  cargarCatalogo(): void {
    this.tiposVehiculoService.getCatalogo().subscribe({
      next: (catalogo) => {
        this.catalogoTipos.set(catalogo);
      },
      error: (error) => {
        console.error('Error al cargar catálogo:', error);
      }
    });
  }

  obtenerIconoCategoria(categoria: string): string {
    return ICONOS_CATEGORIA[categoria as TipoVehiculoCategoria] || '🚗';
  }

  obtenerCategoriaDisplay(categoria: string): string {
    return CATEGORIAS_VEHICULO[categoria as TipoVehiculoCategoria] || categoria;
  }

  abrirFormulario(tipo?: TipoVehiculoDto): void {
    this.tipoEnEdicion = tipo || null;
    
    if (tipo) {
      this.formulario.patchValue({
        nombre: tipo.nombre,
        descripcion: tipo.descripcion,
        categoria: tipo.categoria,
        numeroEjes: tipo.numeroEjes,
        tarifaBase: tipo.tarifaBase,
        esActivo: tipo.esActivo
      });
    } else {
      this.formulario.reset({
        nombre: '',
        descripcion: '',
        categoria: '',
        numeroEjes: 2,
        tarifaBase: 0,
        esActivo: true
      });
    }

    this.mostrandoFormulario = true;
  }

  cerrarFormulario(event?: any): void {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    this.mostrandoFormulario = false;
    this.tipoEnEdicion = null;
    this.formulario.reset();
  }

  crearDesdeCatalogo(catalogo: CatalogoTipoVehiculoDto): void {
    this.formulario.patchValue({
      nombre: catalogo.nombre,
      descripcion: catalogo.descripcion,
      categoria: catalogo.categoria,
      numeroEjes: catalogo.numeroEjes,
      tarifaBase: this.obtenerTarifaSugerida(catalogo.categoria),
      esActivo: true
    });
    this.mostrandoFormulario = true;
  }

  private obtenerTarifaSugerida(categoria: string): number {
    const tarifas: Record<string, number> = {
      'LIVIANO': 1500,
      'PESADO': 3000,
      'ESPECIAL': 5000
    };
    return tarifas[categoria] || 1000;
  }

  guardarTipo(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formData = this.formulario.value as TipoVehiculoFormData;

    const observable = this.tipoEnEdicion
      ? this.tiposVehiculoService.updateTipoVehiculo(this.tipoEnEdicion.id, formData)
      : this.tiposVehiculoService.createTipoVehiculo(formData);

    observable.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarFormulario();
        this.cargarTipos();
      },
      error: (error) => {
        console.error('Error al guardar tipo de vehículo:', error);
        this.guardando.set(false);
        this.error.set('Error al guardar el tipo de vehículo. Por favor, inténtalo de nuevo.');
      }
    });
  }

  editarTipo(tipo: TipoVehiculoDto): void {
    this.abrirFormulario(tipo);
  }

  toggleActivo(tipo: TipoVehiculoDto): void {
    const updateData: UpdateTipoVehiculoRequest = {
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      categoria: tipo.categoria,
      numeroEjes: tipo.numeroEjes,
      tarifaBase: tipo.tarifaBase,
      esActivo: !tipo.esActivo
    };

    this.tiposVehiculoService.updateTipoVehiculo(tipo.id, updateData).subscribe({
      next: () => {
        this.cargarTipos();
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        this.error.set('Error al cambiar el estado del tipo de vehículo.');
      }
    });
  }

  eliminarTipo(tipo: TipoVehiculoDto): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el tipo de vehículo "${tipo.nombre}"?`)) {
      this.tiposVehiculoService.deleteTipoVehiculo(tipo.id).subscribe({
        next: () => {
          this.cargarTipos();
        },
        error: (error) => {
          console.error('Error al eliminar tipo:', error);
          this.error.set('Error al eliminar el tipo de vehículo.');
        }
      });
    }
  }
}
