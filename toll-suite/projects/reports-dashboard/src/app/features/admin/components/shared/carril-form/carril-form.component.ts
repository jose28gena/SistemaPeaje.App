import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Carril, Estacion } from '@toll-suite/data-access';

@Component({
  selector: 'app-carril-form',
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ carril?.id ? 'Editar' : 'Agregar' }} Carril</h2>
          <button class="btn-close" (click)="onCancel()" type="button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form [formGroup]="carrilForm" (ngSubmit)="onSubmit()" class="modal-body">
          <div class="form-grid">
            <!-- Información del Carril -->
            <div class="form-section">
              <h3>Información del Carril</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="estacionId">Estación *</label>
                  <select 
                    id="estacionId"
                    formControlName="estacionId"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('estacionId')"
                  >
                    <option value="">Seleccione una estación</option>
                    <option *ngFor="let estacion of estaciones" [value]="estacion.id">
                      {{ estacion.nombre }}
                    </option>
                  </select>
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('estacionId')">
                    <small *ngIf="carrilForm.get('estacionId')?.errors?.['required']">
                      La estación es requerida
                    </small>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="numero">Número de Carril *</label>
                  <input 
                    type="text" 
                    id="numero"
                    formControlName="numero"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('numero')"
                    placeholder="Ej: C-01"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('numero')">
                    <small *ngIf="carrilForm.get('numero')?.errors?.['required']">
                      El número de carril es requerido
                    </small>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="tipo">Tipo de Carril *</label>
                  <select 
                    id="tipo"
                    formControlName="tipo"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('tipo')"
                  >
                    <option value="">Seleccione un tipo</option>
                    <option value="Normal">Normal</option>
                    <option value="Telepeaje">Telepeaje</option>
                    <option value="Especial">Especial</option>
                  </select>
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('tipo')">
                    <small *ngIf="carrilForm.get('tipo')?.errors?.['required']">
                      El tipo de carril es requerido
                    </small>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="estado">Estado *</label>
                  <select 
                    id="estado"
                    formControlName="estado"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('estado')"
                  >
                    <option value="">Seleccione un estado</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('estado')">
                    <small *ngIf="carrilForm.get('estado')?.errors?.['required']">
                      El estado es requerido
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="onCancel()" [disabled]="isSubmitting">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" (click)="onSubmit()" [disabled]="isSubmitting || carrilForm.invalid">
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
export class CarrilFormComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() carril: Carril | null = null;
  @Input() isSubmitting = false;
  @Input() estaciones: Estacion[] = [];
  
  @Output() save = new EventEmitter<Partial<Carril>>();
  @Output() cancel = new EventEmitter<void>();

  carrilForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.carrilForm = this.createForm();
  }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['carril'] || changes['isOpen']) {
      this.initializeForm();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      estacionId: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      estado: ['', [Validators.required]]
    });
  }

  private initializeForm() {
    if (this.isOpen) {
      if (this.carril) {
        // Edit mode
        this.carrilForm.patchValue({
          estacionId: this.carril.estacionId,
          numero: this.carril.numero,
          tipo: this.carril.tipo,
          estado: this.carril.estado
        });
      } else {
        // Add mode
        this.carrilForm.reset();
      }
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.carrilForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.carrilForm.valid) {
      const formValue = this.carrilForm.value;
      
      const carrilData: Partial<Carril> = {
        ...formValue,
        estacionId: Number(formValue.estacionId)
      };

      if (this.carril?.id) {
        carrilData.id = this.carril.id;
      }

      this.save.emit(carrilData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.carrilForm.controls).forEach(key => {
        this.carrilForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
