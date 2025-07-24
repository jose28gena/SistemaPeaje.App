import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TurnosService, TurnoLiquidacionesService, Turno, TurnoLiquidacion, TurnoEstado } from '@toll-suite/data-access';

@Component({
  selector: 'rd-cierre-turno',
  template: `
    <div class="cierre-turno-container">
      <div class="modal-header">
        <h2>Cierre de Turno</h2>
        <button type="button" class="btn-close" (click)="cancelar.emit()">
          <i class="icon-close"></i>
        </button>
      </div>

      <div class="turno-info-summary">
        <div class="info-item">
          <label>Turno:</label>
          <span>{{ turno.turnoTemplate?.nombre }}</span>
        </div>
        <div class="info-item">
          <label>Empleado:</label>
          <span>{{ turno.empleado?.nombres }} {{ turno.empleado?.apellidos }}</span>
        </div>
        <div class="info-item">
          <label>Estación:</label>
          <span>{{ turno.estacion?.nombre }}</span>
        </div>
        <div class="info-item">
          <label>Hora Inicio:</label>
          <span>{{ turno.horaInicio | date:'shortTime' }}</span>
        </div>
        <div class="info-item">
          <label>Duración:</label>
          <span>{{ getDuracionTurno() }} horas</span>
        </div>
      </div>

      <form [formGroup]="cierreForm" (ngSubmit)="onSubmit()" class="cierre-form">
        <!-- Sección 1: Cuadre de Efectivo -->
        <div class="form-section">
          <h3>Cuadre de Efectivo</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="saldoInicial">Saldo Inicial</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input 
                  type="number" 
                  id="saldoInicial"
                  [value]="saldoInicial"
                  class="form-control"
                  readonly>
              </div>
            </div>

            <div class="form-group">
              <label for="ventasEfectivo">Ventas en Efectivo *</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input 
                  type="number" 
                  id="ventasEfectivo"
                  formControlName="ventasEfectivo" 
                  class="form-control"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  [class.is-invalid]="isFieldInvalid('ventasEfectivo')"
                  (input)="calcularTotales()">
              </div>
              <div class="invalid-feedback" *ngIf="isFieldInvalid('ventasEfectivo')">
                Debe especificar las ventas en efectivo
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="efectivoContado">Efectivo Contado *</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input 
                  type="number" 
                  id="efectivoContado"
                  formControlName="efectivoContado" 
                  class="form-control"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  [class.is-invalid]="isFieldInvalid('efectivoContado')"
                  (input)="calcularTotales()">
              </div>
              <div class="invalid-feedback" *ngIf="isFieldInvalid('efectivoContado')">
                Debe contar el efectivo en caja
              </div>
            </div>

            <div class="form-group">
              <label for="diferenciaCaja">Diferencia en Caja</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input 
                  type="number" 
                  id="diferenciaCaja"
                  [value]="diferenciaCaja"
                  class="form-control"
                  [class.text-success]="diferenciaCaja === 0"
                  [class.text-warning]="diferenciaCaja !== 0"
                  readonly>
              </div>
              <small class="form-text" [class.text-success]="diferenciaCaja === 0" [class.text-warning]="diferenciaCaja !== 0">
                {{ diferenciaCaja === 0 ? 'Caja cuadrada' : (diferenciaCaja > 0 ? 'Sobrante' : 'Faltante') }}
              </small>
            </div>
          </div>
        </div>

        <!-- Sección 2: Ventas Prepago (Tags/Tarjetas) -->
        <div class="form-section">
          <h3>Ventas Prepago</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="ventasTags">Ventas con Tags *</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input 
                  type="number" 
                  id="ventasTags"
                  formControlName="ventasTags" 
                  class="form-control"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  [class.is-invalid]="isFieldInvalid('ventasTags')"
                  (input)="calcularTotales()">
              </div>
              <div class="invalid-feedback" *ngIf="isFieldInvalid('ventasTags')">
                Debe especificar las ventas con tags
              </div>
            </div>

            <div class="form-group">
              <label for="cantidadTags">Cantidad de Tags</label>
              <input 
                type="number" 
                id="cantidadTags"
                formControlName="cantidadTags" 
                class="form-control"
                min="0"
                placeholder="0">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="ventasTarjetas">Ventas con Tarjetas *</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input 
                  type="number" 
                  id="ventasTarjetas"
                  formControlName="ventasTarjetas" 
                  class="form-control"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  [class.is-invalid]="isFieldInvalid('ventasTarjetas')"
                  (input)="calcularTotales()">
              </div>
              <div class="invalid-feedback" *ngIf="isFieldInvalid('ventasTarjetas')">
                Debe especificar las ventas con tarjetas
              </div>
            </div>

            <div class="form-group">
              <label for="cantidadTarjetas">Cantidad de Tarjetas</label>
              <input 
                type="number" 
                id="cantidadTarjetas"
                formControlName="cantidadTarjetas" 
                class="form-control"
                min="0"
                placeholder="0">
            </div>
          </div>
        </div>

        <!-- Sección 3: Exentos -->
        <div class="form-section">
          <h3>Vehículos Exentos</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="cantidadExentos">Cantidad de Exentos *</label>
              <input 
                type="number" 
                id="cantidadExentos"
                formControlName="cantidadExentos" 
                class="form-control"
                min="0"
                placeholder="0"
                [class.is-invalid]="isFieldInvalid('cantidadExentos')">
              <div class="invalid-feedback" *ngIf="isFieldInvalid('cantidadExentos')">
                Debe especificar la cantidad de vehículos exentos
              </div>
            </div>

            <div class="form-group">
              <label for="tiposExentos">Tipos de Exentos</label>
              <input 
                type="text" 
                id="tiposExentos"
                formControlName="tiposExentos" 
                class="form-control"
                placeholder="Ej: Ambulancias, Bomberos, Policía">
              <small class="form-text">Opcional - Especificar tipos de vehículos exentos</small>
            </div>
          </div>
        </div>

        <!-- Resumen Total -->
        <div class="form-section resumen-total">
          <h3>Resumen Total</h3>
          <div class="resumen-grid">
            <div class="resumen-item">
              <label>Total Efectivo:</label>
              <span class="valor">{{ '$' + (totalEfectivo | number:'1.2-2') }}</span>
            </div>
            <div class="resumen-item">
              <label>Total Prepago:</label>
              <span class="valor">{{ '$' + (totalPrepago | number:'1.2-2') }}</span>
            </div>
            <div class="resumen-item">
              <label>Total Exentos:</label>
              <span class="valor">{{ totalExentos }} vehículos</span>
            </div>
            <div class="resumen-item total">
              <label>TOTAL GENERAL:</label>
              <span class="valor">{{ '$' + (totalGeneral | number:'1.2-2') }}</span>
            </div>
          </div>
        </div>

        <!-- Observaciones -->
        <div class="form-section">
          <h3>Observaciones del Cierre</h3>
          <div class="form-group">
            <label for="observaciones">Notas Adicionales</label>
            <textarea 
              id="observaciones"
              formControlName="observaciones" 
              class="form-control"
              rows="3"
              placeholder="Observaciones sobre el cierre del turno, incidencias, etc...">
            </textarea>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="cancelar.emit()">
            <i class="icon-close"></i> Cancelar
          </button>
          <button 
            type="submit" 
            class="btn btn-warning" 
            [disabled]="cierreForm.invalid || cerrando">
            <i class="icon-check" *ngIf="!cerrando"></i>
            <i class="icon-spinner" *ngIf="cerrando"></i>
            {{ cerrando ? 'Cerrando...' : 'Cerrar Turno' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .cierre-turno-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      max-width: 800px;
    }

    .modal-header {
      background: #f8f9fa;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6c757d;
      cursor: pointer;
      padding: 0.5rem;
    }

    .btn-close:hover {
      color: #495057;
    }

    .turno-info-summary {
      background: #f8f9fa;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e9ecef;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-item label {
      font-size: 0.8rem;
      color: #6c757d;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }

    .info-item span {
      color: #2c3e50;
      font-weight: 500;
    }

    .cierre-form {
      padding: 2rem;
      max-height: 60vh;
      overflow-y: auto;
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e9ecef;
    }

    .form-section:last-of-type {
      border-bottom: none;
      margin-bottom: 1rem;
    }

    .form-section h3 {
      margin: 0 0 1.5rem 0;
      color: #495057;
      font-size: 1.1rem;
      font-weight: 600;
      border-left: 4px solid #ffc107;
      padding-left: 1rem;
    }

    .resumen-total h3 {
      border-left-color: #28a745;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #495057;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .form-control:focus {
      border-color: #80bdff;
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .form-control.is-invalid {
      border-color: #dc3545;
    }

    .form-control.is-invalid:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }

    .input-group {
      display: flex;
    }

    .input-group-text {
      padding: 0.75rem;
      margin-bottom: 0;
      font-size: 1rem;
      font-weight: 400;
      line-height: 1.5;
      color: #495057;
      text-align: center;
      white-space: nowrap;
      background-color: #e9ecef;
      border: 1px solid #ced4da;
      border-radius: 0.25rem 0 0 0.25rem;
    }

    .input-group .form-control {
      border-radius: 0 0.25rem 0.25rem 0;
      border-left: 0;
    }

    .invalid-feedback {
      display: block;
      width: 100%;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #dc3545;
    }

    .form-text {
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #6c757d;
    }

    .text-success { color: #28a745 !important; }
    .text-warning { color: #ffc107 !important; }

    .resumen-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .resumen-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: white;
      border-radius: 4px;
      border-left: 4px solid #dee2e6;
    }

    .resumen-item.total {
      background: #28a745;
      color: white;
      border-left-color: #1e7e34;
      font-weight: 600;
    }

    .resumen-item label {
      font-size: 0.9rem;
      margin: 0;
    }

    .resumen-item .valor {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e9ecef;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-warning {
      background: #ffc107;
      color: #212529;
    }

    .btn-warning:hover:not(:disabled) {
      background: #e0a800;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .resumen-grid {
        grid-template-columns: 1fr;
      }

      .turno-info-summary {
        grid-template-columns: 1fr;
      }

      .cierre-form {
        padding: 1rem;
      }

      .modal-header {
        padding: 1rem;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class CierreTurnoComponent implements OnInit {
  @Input() turno!: Turno;
  @Output() turnoCerrado = new EventEmitter<Turno>();
  @Output() cancelar = new EventEmitter<void>();

  cierreForm: FormGroup;
  cerrando = false;
  
  saldoInicial = 0;
  diferenciaCaja = 0;
  totalEfectivo = 0;
  totalPrepago = 0;
  totalExentos = 0;
  totalGeneral = 0;

  constructor(
    private fb: FormBuilder,
    private turnosService: TurnosService,
    private liquidacionesService: TurnoLiquidacionesService
  ) {
    this.cierreForm = this.createForm();
    this.setupFormSubscriptions();
  }

  ngOnInit() {
    this.cargarSaldoInicial();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      ventasEfectivo: [0, [Validators.required, Validators.min(0)]],
      efectivoContado: [0, [Validators.required, Validators.min(0)]],
      ventasTags: [0, [Validators.required, Validators.min(0)]],
      cantidadTags: [0, Validators.min(0)],
      ventasTarjetas: [0, [Validators.required, Validators.min(0)]],
      cantidadTarjetas: [0, Validators.min(0)],
      cantidadExentos: [0, [Validators.required, Validators.min(0)]],
      tiposExentos: [''],
      observaciones: ['']
    });
  }

  private setupFormSubscriptions() {
    // Calcular totales automáticamente cuando cambien los valores
    this.cierreForm.valueChanges.subscribe(() => {
      this.calcularTotales();
    });
  }

  private cargarSaldoInicial() {
    // En un caso real, esto vendría del servicio de asignaciones
    this.saldoInicial = 500; // Simular saldo inicial
  }

  calcularTotales() {
    const formData = this.cierreForm.value;
    
    // Calcular diferencia en caja
    const expectedCash = this.saldoInicial + (formData.ventasEfectivo || 0);
    this.diferenciaCaja = (formData.efectivoContado || 0) - expectedCash;
    
    // Calcular totales
    this.totalEfectivo = (formData.ventasEfectivo || 0);
    this.totalPrepago = (formData.ventasTags || 0) + (formData.ventasTarjetas || 0);
    this.totalExentos = formData.cantidadExentos || 0;
    this.totalGeneral = this.totalEfectivo + this.totalPrepago;
  }

  getDuracionTurno(): string {
    if (!this.turno.horaInicio) return '0';
    
    const inicio = new Date(this.turno.horaInicio);
    const fin = new Date();
    
    const horas = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60));
    const minutos = Math.floor(((fin.getTime() - inicio.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}:${minutos.toString().padStart(2, '0')}`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cierreForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.cierreForm.valid) {
      this.cerrando = true;
      
      const formData = this.cierreForm.value;
      
      // Actualizar el turno con hora de fin
      const turnoActualizado: Partial<Turno> = {
        id: this.turno.id,
        horaFin: new Date(),
        estado: TurnoEstado.Finalizado,
        totalRecaudado: this.totalGeneral,
        observaciones: formData.observaciones
      };

      this.turnosService.update(this.turno.id, turnoActualizado).subscribe({
        next: (turnoActualizado: any) => {
          // Crear la liquidación
          const liquidacion: Partial<TurnoLiquidacion> = {
            turnoId: this.turno.id,
            totalEfectivo: this.totalEfectivo,
            totalTarjetas: formData.ventasTarjetas,
            totalTags: formData.ventasTags,
            totalGeneral: this.totalGeneral,
            diferenciaCaja: this.diferenciaCaja,
            observaciones: `Tags: ${formData.cantidadTags}, Tarjetas: ${formData.cantidadTarjetas}, Exentos: ${formData.cantidadExentos}${formData.tiposExentos ? ', Tipos: ' + formData.tiposExentos : ''}`,
            fechaLiquidacion: new Date(),
            liquidadoPor: 1 // ID del usuario actual
          };

          this.liquidacionesService?.create(liquidacion).subscribe({
            next: () => {
              this.cerrando = false;
              this.turnoCerrado.emit(turnoActualizado);
            },
            error: (error: any) => {
              console.error('Error al crear liquidación:', error);
              this.cerrando = false;
              // Aún así emitir el turno cerrado ya que el turno se actualizó
              this.turnoCerrado.emit(turnoActualizado);
            }
          });
        },
        error: (error: any) => {
          console.error('Error al cerrar turno:', error);
          this.cerrando = false;
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.cierreForm.controls).forEach(key => {
        this.cierreForm.get(key)?.markAsTouched();
      });
    }
  }
}
