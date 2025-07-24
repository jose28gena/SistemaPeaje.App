import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TurnosService, TurnoAsignacionesService, TurnoTemplatesService, Turno, TurnoAsignacion, TurnoTemplate, Empleado, Estacion, TurnoEstado } from '@toll-suite/data-access';

@Component({
  selector: 'rd-apertura-turno',
  template: `
    <div class="apertura-turno-container">
      <div class="modal-header">
        <h2>Apertura de Turno</h2>
        <button type="button" class="btn-close" (click)="cancelar.emit()">
          <i class="icon-close"></i>
        </button>
      </div>

      <form [formGroup]="aperturaForm" (ngSubmit)="onSubmit()" class="apertura-form">
        <!-- Sección 1: Información del Turno -->
        <div class="form-section">
          <h3>Información del Turno</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="turnoTemplate">Plantilla de Turno *</label>
              <select 
                id="turnoTemplate"
                formControlName="turnoTemplateId" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('turnoTemplateId')">
                <option value="">Seleccionar plantilla...</option>
                <option *ngFor="let template of turnoTemplates" [value]="template.id">
                  {{ template.nombre }} ({{ template.duracionPlanificada }}h)
                </option>
              </select>
              <div class="invalid-feedback" *ngIf="isFieldInvalid('turnoTemplateId')">
                Debe seleccionar una plantilla de turno
              </div>
            </div>

            <div class="form-group">
              <label for="fechaTurno">Fecha del Turno *</label>
              <input 
                type="date" 
                id="fechaTurno"
                formControlName="fechaTurno" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('fechaTurno')">
              <div class="invalid-feedback" *ngIf="isFieldInvalid('fechaTurno')">
                Debe especificar la fecha del turno
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="horaInicio">Hora de Inicio *</label>
              <input 
                type="time" 
                id="horaInicio"
                formControlName="horaInicio" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('horaInicio')">
              <div class="invalid-feedback" *ngIf="isFieldInvalid('horaInicio')">
                Debe especificar la hora de inicio
              </div>
            </div>

            <div class="form-group">
              <label for="horaFinPrevista">Hora Fin Prevista</label>
              <input 
                type="time" 
                id="horaFinPrevista"
                formControlName="horaFinPrevista" 
                class="form-control"
                readonly>
              <small class="form-text">Se calcula automáticamente según la plantilla</small>
            </div>
          </div>
        </div>

        <!-- Sección 2: Asignación del Cajero -->
        <div class="form-section">
          <h3>Asignación del Cajero</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="empleado">Empleado/Cajero *</label>
              <select 
                id="empleado"
                formControlName="empleadoId" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('empleadoId')">
                <option value="">Seleccionar empleado...</option>
                <option *ngFor="let empleado of empleadosDisponibles" [value]="empleado.id">
                  {{ empleado.nombres }} {{ empleado.apellidos }} - {{ empleado.puesto }}
                </option>
              </select>
              <div class="invalid-feedback" *ngIf="isFieldInvalid('empleadoId')">
                Debe asignar un empleado al turno
              </div>
            </div>

            <div class="form-group">
              <label for="codigoAcceso">Código de Acceso</label>
              <input 
                type="text" 
                id="codigoAcceso"
                formControlName="codigoAcceso" 
                class="form-control"
                placeholder="Código único para el cajero">
              <small class="form-text">Opcional - para acceso rápido al sistema</small>
            </div>
          </div>
        </div>

        <!-- Sección 3: Asignación del Carril -->
        <div class="form-section">
          <h3>Asignación del Carril/Estación</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="estacion">Estación/Carril *</label>
              <select 
                id="estacion"
                formControlName="estacionId" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('estacionId')">
                <option value="">Seleccionar estación...</option>
                <option *ngFor="let estacion of estacionesDisponibles" [value]="estacion.id">
                  {{ estacion.nombre }} - {{ estacion.ubicacion }}
                </option>
              </select>
              <div class="invalid-feedback" *ngIf="isFieldInvalid('estacionId')">
                Debe asignar una estación/carril
              </div>
            </div>

            <div class="form-group">
              <label for="numeroCarril">Número de Carril</label>
              <input 
                type="number" 
                id="numeroCarril"
                formControlName="numeroCarril" 
                class="form-control"
                placeholder="Ej: 1, 2, 3...">
            </div>
          </div>
        </div>

        <!-- Sección 4: Saldo Inicial -->
        <div class="form-section">
          <h3>Saldo Inicial de Caja</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="montoInicialCaja">Monto Inicial *</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input 
                  type="number" 
                  id="montoInicialCaja"
                  formControlName="montoInicialCaja" 
                  class="form-control"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  [class.is-invalid]="isFieldInvalid('montoInicialCaja')">
              </div>
              <div class="invalid-feedback" *ngIf="isFieldInvalid('montoInicialCaja')">
                Debe especificar el monto inicial de caja
              </div>
            </div>

            <div class="form-group">
              <label for="denominaciones">Denominaciones</label>
              <textarea 
                id="denominaciones"
                formControlName="denominaciones" 
                class="form-control"
                rows="3"
                placeholder="Ej: 50x $1, 20x $5, 10x $10, 5x $20">
              </textarea>
              <small class="form-text">Detalle opcional de billetes y monedas</small>
            </div>
          </div>
        </div>

        <!-- Sección 5: Observaciones -->
        <div class="form-section">
          <h3>Observaciones</h3>
          <div class="form-group">
            <label for="observaciones">Notas Adicionales</label>
            <textarea 
              id="observaciones"
              formControlName="observaciones" 
              class="form-control"
              rows="3"
              placeholder="Observaciones sobre la apertura del turno...">
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
            class="btn btn-primary" 
            [disabled]="aperturaForm.invalid || guardando">
            <i class="icon-check" *ngIf="!guardando"></i>
            <i class="icon-spinner" *ngIf="guardando"></i>
            {{ guardando ? 'Abriendo...' : 'Abrir Turno' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .apertura-turno-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
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

    .apertura-form {
      padding: 2rem;
      max-height: 70vh;
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
      border-left: 4px solid #007bff;
      padding-left: 1rem;
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

    .btn-secondary:hover {
      background: #545b62;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .apertura-form {
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
export class AperturaTurnoComponent implements OnInit {
  @Output() turnoCreado = new EventEmitter<Turno>();
  @Output() cancelar = new EventEmitter<void>();

  aperturaForm: FormGroup;
  guardando = false;
  
  turnoTemplates: TurnoTemplate[] = [];
  empleadosDisponibles: Empleado[] = [];
  estacionesDisponibles: Estacion[] = [];

  constructor(
    private fb: FormBuilder,
    private turnosService: TurnosService,
    private asignacionesService: TurnoAsignacionesService,
    private templatesService: TurnoTemplatesService
  ) {
    this.aperturaForm = this.createForm();
    this.setupFormSubscriptions();
  }

  ngOnInit() {
    this.cargarDatosBasicos();
    this.establecerFechaActual();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      turnoTemplateId: ['', Validators.required],
      fechaTurno: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFinPrevista: [''],
      empleadoId: ['', Validators.required],
      codigoAcceso: [''],
      estacionId: ['', Validators.required],
      numeroCarril: [''],
      montoInicialCaja: [0, [Validators.required, Validators.min(0)]],
      denominaciones: [''],
      observaciones: ['']
    });
  }

  private setupFormSubscriptions() {
    // Calcular hora fin automáticamente
    this.aperturaForm.get('turnoTemplateId')?.valueChanges.subscribe(templateId => {
      this.calcularHoraFin(templateId);
    });

    this.aperturaForm.get('horaInicio')?.valueChanges.subscribe(() => {
      const templateId = this.aperturaForm.get('turnoTemplateId')?.value;
      this.calcularHoraFin(templateId);
    });
  }

  private cargarDatosBasicos() {
    // Cargar plantillas de turno
    this.templatesService.getAll().subscribe({
      next: (response: any) => {
        this.turnoTemplates = response.data || response;
      },
      error: (error: any) => {
        console.error('Error al cargar plantillas:', error);
      }
    });

    // Simular empleados disponibles (en un caso real vendría del servicio)
    this.empleadosDisponibles = [
      { 
        id: 1, 
        cedula: '12345678', 
        nombres: 'Juan', 
        apellidos: 'Pérez', 
        email: 'juan@peaje.com',
        telefono: '123-456-7890',
        direccion: 'Calle 123',
        fechaNacimiento: new Date('1990-01-01'),
        fechaIngreso: new Date('2020-01-01'),
        puesto: 'Cajero Principal',
        salario: 1500,
        estado: 'Activo',
        fechaCreacion: new Date(),
        activo: true
      },
      { 
        id: 2, 
        cedula: '87654321', 
        nombres: 'María', 
        apellidos: 'García', 
        email: 'maria@peaje.com',
        telefono: '987-654-3210',
        direccion: 'Avenida 456',
        fechaNacimiento: new Date('1985-05-15'),
        fechaIngreso: new Date('2019-03-15'),
        puesto: 'Cajero',
        salario: 1200,
        estado: 'Activo',
        fechaCreacion: new Date(),
        activo: true
      },
      { 
        id: 3, 
        cedula: '11223344', 
        nombres: 'Carlos', 
        apellidos: 'López', 
        email: 'carlos@peaje.com',
        telefono: '555-123-4567',
        direccion: 'Boulevard 789',
        fechaNacimiento: new Date('1992-12-10'),
        fechaIngreso: new Date('2021-06-01'),
        puesto: 'Cajero Suplente',
        salario: 1000,
        estado: 'Activo',
        fechaCreacion: new Date(),
        activo: true
      }
    ];

    // Simular estaciones disponibles
    this.estacionesDisponibles = [
      { 
        id: 1, 
        nombre: 'Estación Norte', 
        ubicacion: 'Carril 1-2',
        descripcion: 'Estación principal norte',
        fechaCreacion: new Date(),
        activo: true
      },
      { 
        id: 2, 
        nombre: 'Estación Sur', 
        ubicacion: 'Carril 3-4',
        descripcion: 'Estación principal sur',
        fechaCreacion: new Date(),
        activo: true
      },
      { 
        id: 3, 
        nombre: 'Estación Este', 
        ubicacion: 'Carril 5-6',
        descripcion: 'Estación auxiliar este',
        fechaCreacion: new Date(),
        activo: true
      }
    ];
  }

  private establecerFechaActual() {
    const hoy = new Date().toISOString().split('T')[0];
    this.aperturaForm.patchValue({ fechaTurno: hoy });
  }

  private calcularHoraFin(templateId: number) {
    if (!templateId) return;

    const template = this.turnoTemplates.find(t => t.id === templateId);
    const horaInicio = this.aperturaForm.get('horaInicio')?.value;

    if (template && horaInicio) {
      const [horas, minutos] = horaInicio.split(':').map(Number);
      const inicioDate = new Date();
      inicioDate.setHours(horas, minutos, 0, 0);
      
      const finDate = new Date(inicioDate.getTime() + (template.duracionPlanificada * 60 * 60 * 1000));
      const horaFin = finDate.toTimeString().substring(0, 5);
      
      this.aperturaForm.patchValue({ horaFinPrevista: horaFin });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.aperturaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.aperturaForm.valid) {
      this.guardando = true;
      
      const formData = this.aperturaForm.value;
      
      // Crear el turno
      const nuevoTurno: Partial<Turno> = {
        turnoTemplateId: formData.turnoTemplateId,
        empleadoId: formData.empleadoId,
        estacionId: formData.estacionId,
        fechaTurno: formData.fechaTurno,
        horaInicio: new Date(this.combinarFechaHora(formData.fechaTurno, formData.horaInicio)),
        estado: TurnoEstado.EnCurso,
        observaciones: formData.observaciones
      };

      this.turnosService.create(nuevoTurno).subscribe({
        next: (turnoCreado: any) => {
          // Crear la asignación con el saldo inicial
          const asignacion: Partial<TurnoAsignacion> = {
            turnoId: turnoCreado.id,
            empleadoId: formData.empleadoId,
            montoInicialCajaAsignado: formData.montoInicialCaja,
            observaciones: `${formData.denominaciones ? 'Denominaciones: ' + formData.denominaciones + '. ' : ''}${formData.codigoAcceso ? 'Código: ' + formData.codigoAcceso + '. ' : ''}${formData.numeroCarril ? 'Carril: ' + formData.numeroCarril : ''}`,
            fechaAsignacion: new Date()
          };

          this.asignacionesService.create(asignacion).subscribe({
            next: () => {
              this.guardando = false;
              this.turnoCreado.emit(turnoCreado);
            },
            error: (error: any) => {
              console.error('Error al crear asignación:', error);
              this.guardando = false;
            }
          });
        },
        error: (error: any) => {
          console.error('Error al crear turno:', error);
          this.guardando = false;
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.aperturaForm.controls).forEach(key => {
        this.aperturaForm.get(key)?.markAsTouched();
      });
    }
  }

  private combinarFechaHora(fecha: string, hora: string): string {
    return `${fecha}T${hora}:00`;
  }
}
