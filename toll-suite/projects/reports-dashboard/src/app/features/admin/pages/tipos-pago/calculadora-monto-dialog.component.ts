import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  ConfiguracionTiposPagoService,
  ConfiguracionTipoPago,
  CalcularMontoRequest,
  CalcularMontoResponse
} from '@data-access';

export interface CalculadoraDialogData {
  configuracion?: ConfiguracionTipoPago;
  configuraciones?: ConfiguracionTipoPago[];
}

@Component({
  selector: 'app-calculadora-monto-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="calculadora-container">
      <h2 mat-dialog-title>
        <mat-icon>calculate</mat-icon>
        Calculadora de Montos
      </h2>

      <mat-dialog-content>
        <form [formGroup]="calculadoraForm" class="calculadora-form">
          <!-- Selección de Tipo de Pago -->
          <mat-card class="input-section">
            <mat-card-header>
              <mat-card-title>Parámetros de Cálculo</mat-card-title>
            </mat-card-header>
            
            <mat-card-content>
              <div class="form-row">
                <mat-form-field *ngIf="mostrarSelectorTipo">
                  <mat-label>Tipo de Pago</mat-label>
                  <mat-select formControlName="tipoPagoId" required>
                    <mat-option *ngFor="let config of configuracionesDisponibles" 
                                [value]="config.tipoPagoId">
                      {{ config.tipoPagoNombre }} ({{ config.simboloMoneda }}{{ config.moneda }})
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Monto Base</mat-label>
                  <input matInput type="number" formControlName="montoBase" 
                         min="0" step="0.01" required>
                  <mat-hint>Ingresa el monto a calcular</mat-hint>
                </mat-form-field>
              </div>

              <div class="action-buttons">
                <button mat-raised-button color="primary" 
                        (click)="calcular()" 
                        [disabled]="calculadoraForm.invalid || calculando">
                  <mat-icon>calculate</mat-icon>
                  {{ calculando ? 'Calculando...' : 'Calcular' }}
                  <mat-progress-spinner *ngIf="calculando" diameter="20" mode="indeterminate"></mat-progress-spinner>
                </button>

                <button mat-button (click)="limpiarResultados()">
                  <mat-icon>clear</mat-icon>
                  Limpiar
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Configuración Actual -->
          <mat-card class="config-section" *ngIf="configuracionSeleccionada">
            <mat-card-header>
              <mat-card-title>Configuración Actual</mat-card-title>
              <mat-card-subtitle>{{ configuracionSeleccionada.tipoPagoNombre }}</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="config-grid">
                <div class="config-item">
                  <label>Moneda:</label>
                  <span>{{ configuracionSeleccionada.simboloMoneda }} {{ configuracionSeleccionada.moneda }}</span>
                </div>
                
                <div class="config-item">
                  <label>Comisión %:</label>
                  <span>{{ configuracionSeleccionada.comisionPorcentaje }}%</span>
                </div>
                
                <div class="config-item">
                  <label>Comisión Fija:</label>
                  <span>{{ formatearMonto(configuracionSeleccionada.comisionFija, configuracionSeleccionada.simboloMoneda) }}</span>
                </div>
                
                <div class="config-item">
                  <label>Descuento:</label>
                  <span>{{ configuracionSeleccionada.descuentoPorDefecto }}%</span>
                </div>
                
                <div class="config-item">
                  <label>Límite Transacción:</label>
                  <span>{{ formatearMonto(configuracionSeleccionada.limiteTransaccion || 0, configuracionSeleccionada.simboloMoneda) }}</span>
                </div>
                
                <div class="config-item">
                  <label>Límite Diario:</label>
                  <span>{{ formatearMonto(configuracionSeleccionada.limiteDiario || 0, configuracionSeleccionada.simboloMoneda) }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Resultados del Cálculo -->
          <mat-card class="resultado-section" *ngIf="resultadoCalculo">
            <mat-card-header>
              <mat-card-title>
                <mat-icon [color]="resultadoCalculo.excedeLimiteTransaccion ? 'warn' : 'primary'">
                  {{ resultadoCalculo.excedeLimiteTransaccion ? 'warning' : 'check_circle' }}
                </mat-icon>
                Resultado del Cálculo
              </mat-card-title>
              <mat-card-subtitle>{{ resultadoCalculo.tipoPagoNombre }}</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <!-- Alerta de Límite -->
              <div class="alert-limite" *ngIf="resultadoCalculo.excedeLimiteTransaccion">
                <mat-icon>warning</mat-icon>
                <span>¡Atención! El monto excede el límite por transacción</span>
              </div>

              <!-- Desglose del Cálculo -->
              <div class="calculo-desglose">
                <div class="desglose-header">
                  <h4>Desglose del Cálculo</h4>
                </div>

                <div class="desglose-items">
                  <div class="desglose-item monto-base">
                    <label>Monto Base:</label>
                    <span>{{ formatearMontoResultado(resultadoCalculo.montoBase) }}</span>
                  </div>

                  <div class="desglose-item descuento" *ngIf="resultadoCalculo.descuentoAplicado > 0">
                    <label>Descuento ({{ configuracionSeleccionada?.descuentoPorDefecto }}%):</label>
                    <span class="valor-negativo">-{{ formatearMontoResultado(resultadoCalculo.descuentoAplicado) }}</span>
                  </div>

                  <div class="desglose-item subtotal" *ngIf="resultadoCalculo.descuentoAplicado > 0">
                    <label>Subtotal:</label>
                    <span>{{ formatearMontoResultado(resultadoCalculo.montoBase - resultadoCalculo.descuentoAplicado) }}</span>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="desglose-item comision" *ngIf="resultadoCalculo.comisionPorcentual > 0">
                    <label>Comisión Porcentual ({{ configuracionSeleccionada?.comisionPorcentaje }}%):</label>
                    <span class="valor-positivo">+{{ formatearMontoResultado(resultadoCalculo.comisionPorcentual) }}</span>
                  </div>

                  <div class="desglose-item comision" *ngIf="resultadoCalculo.comisionFija > 0">
                    <label>Comisión Fija:</label>
                    <span class="valor-positivo">+{{ formatearMontoResultado(resultadoCalculo.comisionFija) }}</span>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="desglose-item total">
                    <label><strong>Monto Final:</strong></label>
                    <span class="monto-final">{{ formatearMontoResultado(resultadoCalculo.montoFinal) }}</span>
                  </div>
                </div>
              </div>

              <!-- Información Adicional -->
              <div class="info-adicional">
                <div class="info-item">
                  <mat-icon>access_time</mat-icon>
                  <span>Tiempo de procesamiento: {{ configuracionSeleccionada?.tiempoEsperaSegundos }}s</span>
                </div>
                
                <div class="info-item" *ngIf="configuracionSeleccionada?.requiereValidacionAdicional">
                  <mat-icon>security</mat-icon>
                  <span>Requiere validación adicional</span>
                </div>
                
                <div class="info-item" *ngIf="configuracionSeleccionada?.permiteTransaccionesParcialeS">
                  <mat-icon>payments</mat-icon>
                  <span>Permite transacciones parciales</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Ejemplos Rápidos -->
          <mat-card class="ejemplos-section" *ngIf="configuracionSeleccionada && !resultadoCalculo">
            <mat-card-header>
              <mat-card-title>Ejemplos Rápidos</mat-card-title>
            </mat-card-header>
            
            <mat-card-content>
              <div class="ejemplos-grid">
                <button mat-stroked-button 
                        *ngFor="let monto of montosEjemplo" 
                        (click)="calcularEjemplo(monto)"
                        class="ejemplo-btn">
                  {{ formatearMonto(monto, configuracionSeleccionada.simboloMoneda) }}
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">
          <mat-icon>close</mat-icon>
          Cerrar
        </button>
        
        <button mat-raised-button color="accent" 
                (click)="nuevoCalculo()" 
                *ngIf="resultadoCalculo">
          <mat-icon>refresh</mat-icon>
          Nuevo Cálculo
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .calculadora-container {
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #2c3e50;
    }

    .calculadora-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .input-section {
      .form-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;

        mat-form-field {
          flex: 1;
        }
      }

      .action-buttons {
        display: flex;
        gap: 0.75rem;
        justify-content: center;

        button mat-progress-spinner {
          margin-left: 0.5rem;
        }
      }
    }

    .config-section {
      background: #f8f9fa;
      border: 1px solid #e9ecef;

      .config-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.75rem;

        .config-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: white;
          border-radius: 6px;
          border: 1px solid #e9ecef;

          label {
            font-weight: 600;
            color: #495057;
          }

          span {
            color: #2c3e50;
            font-weight: 500;
          }
        }
      }
    }

    .resultado-section {
      background: #e8f5e8;
      border: 1px solid #c3e6c3;

      .alert-limite {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 6px;
        margin-bottom: 1rem;
        color: #856404;

        mat-icon {
          color: #ff9800;
        }
      }

      .calculo-desglose {
        .desglose-header {
          margin-bottom: 1rem;

          h4 {
            margin: 0;
            color: #155724;
            font-size: 1.1rem;
          }
        }

        .desglose-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .desglose-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0.75rem;
            background: white;
            border-radius: 6px;
            border: 1px solid #c3e6c3;

            label {
              color: #495057;
              font-weight: 500;
            }

            span {
              font-weight: 600;

              &.valor-negativo {
                color: #dc3545;
              }

              &.valor-positivo {
                color: #fd7e14;
              }

              &.monto-final {
                color: #155724;
                font-size: 1.1rem;
              }
            }

            &.total {
              background: #d4edda;
              border-color: #c3e6c3;
              font-size: 1.05rem;
            }

            &.monto-base {
              background: #e3f2fd;
              border-color: #bbdefb;
            }
          }

          mat-divider {
            margin: 0.25rem 0;
          }
        }
      }

      .info-adicional {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #c3e6c3;

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          color: #155724;
          font-size: 0.9rem;

          mat-icon {
            font-size: 1.2rem;
            color: #28a745;
          }
        }
      }
    }

    .ejemplos-section {
      .ejemplos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.75rem;

        .ejemplo-btn {
          min-height: 40px;
          font-weight: 600;
        }
      }
    }

    mat-dialog-actions {
      padding: 1.5rem 0 0 0;
      border-top: 1px solid #e9ecef;
      gap: 0.75rem;

      button mat-icon {
        margin-right: 0.5rem;
      }
    }

    @media (max-width: 600px) {
      .calculadora-container {
        max-width: 95vw;
      }

      .form-row {
        flex-direction: column;
      }

      .config-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }

      .ejemplos-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class CalculadoraMontoDialogComponent implements OnInit {
  calculadoraForm!: FormGroup;
  calculando = false;
  mostrarSelectorTipo = false;
  configuracionesDisponibles: ConfiguracionTipoPago[] = [];
  configuracionSeleccionada: ConfiguracionTipoPago | null = null;
  resultadoCalculo: CalcularMontoResponse | null = null;
  montosEjemplo = [100, 500, 1000, 2500, 5000];

  constructor(
    private dialogRef: MatDialogRef<CalculadoraMontoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CalculadoraDialogData,
    private fb: FormBuilder,
    private configuracionService: ConfiguracionTiposPagoService
  ) {
    this.initializeForm();
    this.setupData();
  }

  ngOnInit(): void {
    // Auto-calcular si hay datos pre-cargados
    if (this.configuracionSeleccionada && this.calculadoraForm.get('montoBase')?.value) {
      this.calcular();
    }
  }

  private initializeForm(): void {
    this.calculadoraForm = this.fb.group({
      tipoPagoId: ['', Validators.required],
      montoBase: ['', [Validators.required, Validators.min(0.01)]]
    });

    // Cambiar configuración cuando se selecciona otro tipo
    this.calculadoraForm.get('tipoPagoId')?.valueChanges.subscribe(tipoPagoId => {
      if (tipoPagoId) {
        this.configuracionSeleccionada = this.configuracionesDisponibles.find(
          c => c.tipoPagoId === tipoPagoId
        ) || null;
        this.limpiarResultados();
      }
    });
  }

  private setupData(): void {
    if (this.data.configuracion) {
      // Modo con configuración específica
      this.configuracionSeleccionada = this.data.configuracion;
      this.configuracionesDisponibles = [this.data.configuracion];
      this.calculadoraForm.patchValue({
        tipoPagoId: this.data.configuracion.tipoPagoId
      });
      this.mostrarSelectorTipo = false;
    } else if (this.data.configuraciones) {
      // Modo con múltiples configuraciones
      this.configuracionesDisponibles = this.data.configuraciones.filter(c => c.estaActivo);
      this.mostrarSelectorTipo = true;
      
      if (this.configuracionesDisponibles.length > 0) {
        this.configuracionSeleccionada = this.configuracionesDisponibles[0];
        this.calculadoraForm.patchValue({
          tipoPagoId: this.configuracionesDisponibles[0].tipoPagoId
        });
      }
    }
  }

  calcular(): void {
    if (this.calculadoraForm.invalid || !this.configuracionSeleccionada) return;

    this.calculando = true;
    const request: CalcularMontoRequest = {
      tipoPagoId: this.configuracionSeleccionada.tipoPagoId,
      montoBase: this.calculadoraForm.get('montoBase')?.value
    };

    this.configuracionService.calcularMonto(request).subscribe({
      next: (resultado) => {
        this.resultadoCalculo = resultado;
        this.calculando = false;
      },
      error: (error) => {
        console.error('Error calculando monto:', error);
        this.calculando = false;
      }
    });
  }

  calcularEjemplo(monto: number): void {
    this.calculadoraForm.patchValue({ montoBase: monto });
    this.calcular();
  }

  limpiarResultados(): void {
    this.resultadoCalculo = null;
  }

  nuevoCalculo(): void {
    this.resultadoCalculo = null;
    this.calculadoraForm.patchValue({ montoBase: '' });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  formatearMonto(monto: number, simbolo: string = '$'): string {
    if (!monto) return `${simbolo}0.00`;
    return `${simbolo}${monto.toLocaleString('es-MX', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

  formatearMontoResultado(monto: number): string {
    return this.formatearMonto(monto, this.resultadoCalculo?.simboloMoneda || '$');
  }
}
