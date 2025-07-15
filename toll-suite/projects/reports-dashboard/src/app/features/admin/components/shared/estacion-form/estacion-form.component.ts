import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Estacion } from '@toll-suite/data-access';

@Component({
  selector: 'app-estacion-form',
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Editar Estación' : 'Nueva Estación' }}</h3>
          <button class="close-btn" (click)="onCancel()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form [formGroup]="estacionForm" (ngSubmit)="onSubmit()">
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label for="nombre">
                  Nombre <span class="required">*</span>
                </label>
                <input
                  id="nombre"
                  type="text"
                  formControlName="nombre"
                  placeholder="Ingrese el nombre de la estación"
                  [class.error]="isFieldInvalid('nombre')"
                >
                <div class="error-message" *ngIf="isFieldInvalid('nombre')">
                  <span *ngIf="estacionForm.get('nombre')?.errors?.['required']">
                    El nombre es requerido
                  </span>
                  <span *ngIf="estacionForm.get('nombre')?.errors?.['minlength']">
                    El nombre debe tener al menos 3 caracteres
                  </span>
                </div>
              </div>

              <div class="form-group">
                <label for="ubicacion">
                  Ubicación <span class="required">*</span>
                </label>
                <input
                  id="ubicacion"
                  type="text"
                  formControlName="ubicacion"
                  placeholder="Ej: Km 25 Autopista Norte"
                  [class.error]="isFieldInvalid('ubicacion')"
                >
                <div class="error-message" *ngIf="isFieldInvalid('ubicacion')">
                  La ubicación es requerida
                </div>
              </div>

              <div class="form-group full-width">
                <label for="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  formControlName="descripcion"
                  placeholder="Descripción opcional de la estación"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="activo">Estado</label>
                <select id="activo" formControlName="activo">
                  <option [value]="true">Activo</option>
                  <option [value]="false">Inactivo</option>
                </select>
              </div>

              <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input
                  id="telefono"
                  type="tel"
                  formControlName="telefono"
                  placeholder="Ej: +57 300 123 4567"
                >
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="contacto@estacion.com"
                  [class.error]="isFieldInvalid('email')"
                >
                <div class="error-message" *ngIf="isFieldInvalid('email')">
                  Ingrese un email válido
                </div>
              </div>

              <div class="form-group">
                <label for="codigoPostal">Código Postal</label>
                <input
                  id="codigoPostal"
                  type="text"
                  formControlName="codigoPostal"
                  placeholder="110111"
                >
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="estacionForm.invalid || isSubmitting"
            >
              <i class="fas fa-spinner fa-spin" *ngIf="isSubmitting"></i>
              {{ isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
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
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #dee2e6;
      background: #f8f9fa;
      border-radius: 8px 8px 0 0;
    }

    .modal-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
      padding: 0.5rem;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: #e9ecef;
      color: #495057;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #495057;
      font-size: 0.95rem;
    }

    .required {
      color: #dc3545;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
      border-color: #dc3545;
    }

    .error-message {
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #dc3545;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #dee2e6;
      background: #f8f9fa;
      border-radius: 0 0 8px 8px;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
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
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .modal-content {
        margin: 0.5rem;
        max-width: none;
      }

      .form-grid {
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
export class EstacionFormComponent implements OnInit {
  @Input() isOpen = false;
  @Input() estacion: Estacion | null = null;
  @Input() isSubmitting = false;
  @Output() save = new EventEmitter<Partial<Estacion>>();
  @Output() cancel = new EventEmitter<void>();

  estacionForm: FormGroup;
  isEditMode = false;

  constructor(private formBuilder: FormBuilder) {
    this.estacionForm = this.createForm();
  }

  ngOnInit() {
    if (this.estacion) {
      this.isEditMode = true;
      this.loadEstacionData();
    }
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      ubicacion: ['', [Validators.required]],
      descripcion: [''],
      activo: [true],
      telefono: [''],
      email: ['', [Validators.email]],
      codigoPostal: ['']
    });
  }

  private loadEstacionData() {
    if (this.estacion) {
      this.estacionForm.patchValue({
        nombre: this.estacion.nombre,
        ubicacion: this.estacion.ubicacion,
        descripcion: this.estacion.descripcion || '',
        activo: this.estacion.activo,
        telefono: (this.estacion as any).telefono || '',
        email: (this.estacion as any).email || '',
        codigoPostal: (this.estacion as any).codigoPostal || ''
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.estacionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.estacionForm.valid) {
      const formData = this.estacionForm.value;
      
      // Convertir el string 'true'/'false' a boolean si es necesario
      if (typeof formData.activo === 'string') {
        formData.activo = formData.activo === 'true';
      }

      const estacionData: Partial<Estacion> = {
        ...formData,
        id: this.isEditMode ? this.estacion?.id : undefined
      };

      this.save.emit(estacionData);
    }
  }

  onCancel() {
    this.estacionForm.reset();
    this.cancel.emit();
  }

  resetForm() {
    this.estacionForm.reset();
    this.isEditMode = false;
    this.estacion = null;
  }
}
