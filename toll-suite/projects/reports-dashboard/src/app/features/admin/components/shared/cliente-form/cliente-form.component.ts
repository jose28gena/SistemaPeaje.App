import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cliente, TipoCliente } from '@toll-suite/data-access';

@Component({
  selector: 'app-cliente-form',
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ cliente?.id ? 'Editar' : 'Agregar' }} Cliente</h2>
          <button class="btn-close" (click)="onCancel()" type="button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form [formGroup]="clienteForm" (ngSubmit)="onSubmit()" class="modal-body">
          <div class="form-grid">
            <!-- Información Personal -->
            <div class="form-section">
              <h3>Información Personal</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="numeroDocumento">Número de Documento *</label>
                  <input 
                    type="text" 
                    id="numeroDocumento"
                    formControlName="numeroDocumento"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('numeroDocumento')"
                    placeholder="Ej: 1234567890"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('numeroDocumento')">
                    <small *ngIf="clienteForm.get('numeroDocumento')?.errors?.['required']">
                      El número de documento es requerido
                    </small>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="tipoDocumento">Tipo de Documento</label>
                  <select 
                    id="tipoDocumento"
                    formControlName="tipoDocumento"
                    class="form-control"
                  >
                    <option value="">Seleccione un tipo</option>
                    <option value="Cédula">Cédula</option>
                    <option value="RUC">RUC</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
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
                    <small *ngIf="clienteForm.get('nombres')?.errors?.['required']">
                      Los nombres son requeridos
                    </small>
                  </div>
                </div>
              </div>

              <div class="form-row">
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
                    <small *ngIf="clienteForm.get('apellidos')?.errors?.['required']">
                      Los apellidos son requeridos
                    </small>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="email">Email</label>
                  <input 
                    type="email" 
                    id="email"
                    formControlName="email"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('email')"
                    placeholder="Ej: juan@email.com"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('email')">
                    <small *ngIf="clienteForm.get('email')?.errors?.['email']">
                      Ingrese un email válido
                    </small>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="telefono">Teléfono</label>
                  <input 
                    type="tel" 
                    id="telefono"
                    formControlName="telefono"
                    class="form-control"
                    placeholder="Ej: +593 99 123 4567"
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="direccion">Dirección</label>
                  <textarea 
                    id="direccion"
                    formControlName="direccion"
                    class="form-control"
                    rows="3"
                    placeholder="Ej: Av. Principal 123, Sector Norte"
                  ></textarea>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="fechaNacimiento">Fecha de Nacimiento</label>
                  <input 
                    type="date" 
                    id="fechaNacimiento"
                    formControlName="fechaNacimiento"
                    class="form-control"
                  >
                </div>
              </div>
            </div>

            <!-- Información del Cliente -->
            <div class="form-section">
              <h3>Información del Cliente</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="tipoClienteId">Tipo de Cliente</label>
                  <select 
                    id="tipoClienteId"
                    formControlName="tipoClienteId"
                    class="form-control"
                  >
                    <option value="">Seleccione un tipo</option>
                    <option *ngFor="let tipo of tiposCliente" [value]="tipo.id">
                      {{ tipo.nombre }}
                      <span *ngIf="tipo.tieneDescuento"> ({{ tipo.descuentoPorcentaje }}% descuento)</span>
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="onCancel()" [disabled]="isSubmitting">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" (click)="onSubmit()" [disabled]="isSubmitting || clienteForm.invalid">
            <i class="fas fa-spinner fa-spin" *ngIf="isSubmitting"></i>
            <i class="fas fa-save" *ngIf="!isSubmitting"></i>
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
      max-width: 600px;
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

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 6px;
      border-left: 4px solid #007bff;
    }

    .form-section h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #495057;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      background: white;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .form-control.is-invalid {
      border-color: #dc3545;
    }

    .form-control.is-invalid:focus {
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }

    .invalid-feedback {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
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

    @media (max-width: 768px) {
      .modal-content {
        margin: 0.5rem;
        max-width: none;
      }
      
      .form-row {
        flex-direction: column;
      }
      
      .modal-footer {
        flex-direction: column;
      }
    }
  `]
})
export class ClienteFormComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() cliente: Cliente | null = null;
  @Input() isSubmitting = false;
  @Input() tiposCliente: TipoCliente[] = [];
  
  @Output() save = new EventEmitter<Partial<Cliente>>();
  @Output() cancel = new EventEmitter<void>();

  clienteForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.clienteForm = this.createForm();
  }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cliente'] || changes['isOpen']) {
      this.initializeForm();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      numeroDocumento: ['', [Validators.required]],
      tipoDocumento: [''],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      email: ['', [Validators.email]],
      telefono: [''],
      direccion: [''],
      fechaNacimiento: [''],
      tipoClienteId: ['']
    });
  }

  private initializeForm() {
    if (this.isOpen) {
      if (this.cliente) {
        // Edit mode
        this.clienteForm.patchValue({
          numeroDocumento: this.cliente.numeroDocumento || '',
          tipoDocumento: this.cliente.tipoDocumento || '',
          nombres: this.cliente.nombres || '',
          apellidos: this.cliente.apellidos || '',
          email: this.cliente.email || '',
          telefono: this.cliente.telefono || '',
          direccion: this.cliente.direccion || '',
          fechaNacimiento: this.cliente.fechaNacimiento ? 
            new Date(this.cliente.fechaNacimiento).toISOString().split('T')[0] : '',
          tipoClienteId: this.cliente.tipoClienteId || ''
        });
      } else {
        // Add mode
        this.clienteForm.reset();
      }
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.clienteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.clienteForm.valid) {
      const formValue = this.clienteForm.value;
      
      const clienteData: Partial<Cliente> = {
        ...formValue,
        fechaNacimiento: formValue.fechaNacimiento ? new Date(formValue.fechaNacimiento) : undefined,
        tipoClienteId: formValue.tipoClienteId ? Number(formValue.tipoClienteId) : undefined
      };

      if (this.cliente?.id) {
        clienteData.id = this.cliente.id;
      }

      this.save.emit(clienteData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.clienteForm.controls).forEach(key => {
        this.clienteForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
