import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Empleado, Estacion } from '@toll-suite/data-access';

@Component({
  selector: 'app-empleado-form',
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ empleado?.id ? 'Editar' : 'Agregar' }} Empleado</h2>
          <button class="btn-close" (click)="onCancel()" type="button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form [formGroup]="empleadoForm" (ngSubmit)="onSubmit()" class="modal-body">
          <div class="form-grid">
            <!-- Información Personal -->
            <div class="form-section">
              <h3>Información Personal</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="cedula">Cédula *</label>
                  <input 
                    type="text" 
                    id="cedula"
                    formControlName="cedula"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('cedula')"
                    placeholder="Ej: 1234567890"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('cedula')">
                    <small *ngIf="empleadoForm.get('cedula')?.errors?.['required']">
                      La cédula es requerida
                    </small>
                    <small *ngIf="empleadoForm.get('cedula')?.errors?.['pattern']">
                      La cédula debe contener solo números
                    </small>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="nombres">Nombres *</label>
                  <input 
                    type="text" 
                    id="nombres"
                    formControlName="nombres"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('nombres')"
                    placeholder="Ej: Juan Carlos"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('nombres')">
                    La nombres son requeridos
                  </div>
                </div>

                <div class="form-group">
                  <label for="apellidos">Apellidos *</label>
                  <input 
                    type="text" 
                    id="apellidos"
                    formControlName="apellidos"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('apellidos')"
                    placeholder="Ej: Pérez González"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('apellidos')">
                    Los apellidos son requeridos
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="email">Email *</label>
                  <input 
                    type="email" 
                    id="email"
                    formControlName="email"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('email')"
                    placeholder="Ej: juan.perez@empresa.com"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('email')">
                    <small *ngIf="empleadoForm.get('email')?.errors?.['required']">
                      El email es requerido
                    </small>
                    <small *ngIf="empleadoForm.get('email')?.errors?.['email']">
                      El email debe tener un formato válido
                    </small>
                  </div>
                </div>

                <div class="form-group">
                  <label for="telefono">Teléfono *</label>
                  <input 
                    type="tel" 
                    id="telefono"
                    formControlName="telefono"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('telefono')"
                    placeholder="Ej: +593 99 123 4567"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('telefono')">
                    El teléfono es requerido
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="direccion">Dirección *</label>
                <textarea 
                  id="direccion"
                  formControlName="direccion"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('direccion')"
                  placeholder="Ej: Av. Principal 123, Sector Norte"
                  rows="2"
                ></textarea>
                <div class="invalid-feedback" *ngIf="isFieldInvalid('direccion')">
                  La dirección es requerida
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="fechaNacimiento">Fecha de Nacimiento *</label>
                  <input 
                    type="date" 
                    id="fechaNacimiento"
                    formControlName="fechaNacimiento"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('fechaNacimiento')"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('fechaNacimiento')">
                    La fecha de nacimiento es requerida
                  </div>
                </div>

                <div class="form-group">
                  <label for="numeroEmergencia">Contacto de Emergencia</label>
                  <input 
                    type="tel" 
                    id="numeroEmergencia"
                    formControlName="numeroEmergencia"
                    class="form-control"
                    placeholder="Ej: +593 99 876 5432"
                  >
                </div>
              </div>
            </div>

            <!-- Información Laboral -->
            <div class="form-section">
              <h3>Información Laboral</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="puesto">Puesto *</label>
                  <select 
                    id="puesto"
                    formControlName="puesto"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('puesto')"
                  >
                    <option value="">Seleccionar puesto</option>
                    <option value="Operador de Cabina">Operador de Cabina</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Técnico de Mantenimiento">Técnico de Mantenimiento</option>
                    <option value="Seguridad">Seguridad</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Contador">Contador</option>
                    <option value="Gerente">Gerente</option>
                  </select>
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('puesto')">
                    El puesto es requerido
                  </div>
                </div>

                <div class="form-group">
                  <label for="fechaIngreso">Fecha de Ingreso *</label>
                  <input 
                    type="date" 
                    id="fechaIngreso"
                    formControlName="fechaIngreso"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('fechaIngreso')"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('fechaIngreso')">
                    La fecha de ingreso es requerida
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="salario">Salario *</label>
                  <input 
                    type="number" 
                    id="salario"
                    formControlName="salario"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('salario')"
                    placeholder="Ej: 450.00"
                    min="0"
                    step="0.01"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('salario')">
                    <small *ngIf="empleadoForm.get('salario')?.errors?.['required']">
                      El salario es requerido
                    </small>
                    <small *ngIf="empleadoForm.get('salario')?.errors?.['min']">
                      El salario debe ser mayor a 0
                    </small>
                  </div>
                </div>

                <div class="form-group">
                  <label for="estacionId">Estación Asignada</label>
                  <select 
                    id="estacionId"
                    formControlName="estacionId"
                    class="form-control"
                  >
                    <option value="">Sin asignar</option>
                    <option *ngFor="let estacion of estaciones" [value]="estacion.id">
                      {{ estacion.nombre }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="estado">Estado *</label>
                <select 
                  id="estado"
                  formControlName="estado"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('estado')"
                >
                  <option value="">Seleccionar estado</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Suspendido">Suspendido</option>
                  <option value="Vacaciones">Vacaciones</option>
                  <option value="Licencia Médica">Licencia Médica</option>
                </select>
                <div class="invalid-feedback" *ngIf="isFieldInvalid('estado')">
                  El estado es requerido
                </div>
              </div>

              <div class="form-group">
                <label for="observaciones">Observaciones</label>
                <textarea 
                  id="observaciones"
                  formControlName="observaciones"
                  class="form-control"
                  placeholder="Información adicional sobre el empleado..."
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
        </form>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="onCancel()" [disabled]="isSubmitting">
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            (click)="onSubmit()" 
            [disabled]="empleadoForm.invalid || isSubmitting"
          >
            <i class="fas fa-spinner fa-spin" *ngIf="isSubmitting"></i>
            {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
      max-width: 900px;
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

    .modal-header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
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
      padding: 2rem;
    }

    .form-grid {
      display: grid;
      gap: 2rem;
    }

    .form-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 6px;
      border-left: 4px solid #007bff;
    }

    .form-section h3 {
      margin: 0 0 1.5rem 0;
      color: #2c3e50;
      font-size: 1.2rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
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
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
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
      display: block;
      width: 100%;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #dc3545;
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

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
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

    @media (max-width: 768px) {
      .modal-content {
        margin: 1rem;
        max-width: none;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding: 1rem;
      }
    }
  `]
})
export class EmpleadoFormComponent implements OnInit {
  @Input() isOpen = false;
  @Input() empleado: Empleado | null = null;
  @Input() isSubmitting = false;
  @Input() estaciones: Estacion[] = [];
  
  @Output() save = new EventEmitter<Partial<Empleado>>();
  @Output() cancel = new EventEmitter<void>();

  empleadoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.empleadoForm = this.createForm();
  }

  ngOnInit() {
    console.log('EmpleadoFormComponent ngOnInit called');
    console.log('Input values:', {
      isOpen: this.isOpen,
      empleado: this.empleado,
      estaciones: this.estaciones?.length || 0
    });
    
    if (this.empleado) {
      this.empleadoForm.patchValue({
        ...this.empleado,
        fechaNacimiento: this.formatDateForInput(this.empleado.fechaNacimiento),
        fechaIngreso: this.formatDateForInput(this.empleado.fechaIngreso)
      });
    } else {
      console.log('No empleado data, form ready for new employee');
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      fechaIngreso: ['', Validators.required],
      puesto: ['', Validators.required],
      salario: ['', [Validators.required, Validators.min(0.01)]],
      estacionId: [''],
      estado: ['', Validators.required],
      numeroEmergencia: [''],
      observaciones: ['']
    });
  }

  private formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.empleadoForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit() {
    if (this.empleadoForm.valid) {
      const formValue = this.empleadoForm.value;
      
      const empleadoData: Partial<Empleado> = {
        ...formValue,
        id: this.empleado?.id,
        estacionId: formValue.estacionId || null,
        fechaNacimiento: new Date(formValue.fechaNacimiento),
        fechaIngreso: new Date(formValue.fechaIngreso),
        activo: formValue.estado === 'Activo'
      };

      this.save.emit(empleadoData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.empleadoForm.controls).forEach(key => {
        this.empleadoForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.cancel.emit();
    this.empleadoForm.reset();
  }
}
