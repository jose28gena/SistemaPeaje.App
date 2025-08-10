import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Estacion, Tarifa, TipoVehiculo } from '@toll-suite/data-access';

@Component({
  selector: 'app-tarifa-form',
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onCancel()">
      <div class="modal-content form-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editMode ? 'Nueva vigencia de tarifa' : 'Crear Tarifa' }}</h3>
          <p *ngIf="editMode" class="text-info">
            <i class="fas fa-info-circle"></i>
            Se creará una nueva vigencia. La tarifa anterior se desactivará automáticamente.
          </p>
          <button class="btn-close" (click)="onCancel()" [disabled]="isSubmitting">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form [formGroup]="tarifaForm" (ngSubmit)="onSubmit()">
          <div class="modal-body">
            <div class="form-group">
              <label for="tipoVehiculoId" class="form-label">Tipo de Vehículo <span class="required">*</span></label>
              <select 
                id="tipoVehiculoId" 
                formControlName="tipoVehiculoId"
                class="form-select"
                [class.is-invalid]="isFieldInvalid('tipoVehiculoId')"
              >
                <option value="" disabled>Seleccionar Tipo de Vehículo</option>
                <option *ngFor="let tipo of tiposVehiculo" [value]="tipo.id">
                  {{ tipo.nombre }} ({{ tipo.categoria }})
                </option>
              </select>
              <div class="invalid-feedback" *ngIf="isFieldInvalid('tipoVehiculoId')">
                El tipo de vehículo es obligatorio
              </div>
            </div>

            <div class="form-group">
              <label for="estacionId" class="form-label">Estación</label>
              <select 
                id="estacionId" 
                formControlName="estacionId"
                class="form-select"
              >
                <option value="">Todas las estaciones</option>
                <option *ngFor="let estacion of estaciones" [value]="estacion.id">
                  {{ estacion.nombre }}
                </option>
              </select>
              <small class="form-text text-muted">
                Si no selecciona una estación, la tarifa aplicará para todas las estaciones.
              </small>
            </div>

            <div class="form-group">
              <label for="monto" class="form-label">Monto <span class="required">*</span></label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input 
                  type="number"
                  id="monto"
                  formControlName="monto"
                  class="form-control"
                  step="0.01"
                  min="0"
                  [class.is-invalid]="isFieldInvalid('monto')"
                  placeholder="Ejemplo: 1.50"
                >
              </div>
              <div class="invalid-feedback" *ngIf="isFieldInvalid('monto')">
                <span *ngIf="tarifaForm.controls['monto'].errors?.['required']">El monto es obligatorio</span>
                <span *ngIf="tarifaForm.controls['monto'].errors?.['min']">El monto debe ser mayor a 0</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="fechaVigenciaInicio" class="form-label">Fecha de Inicio de Vigencia <span class="required">*</span></label>
                <input 
                  type="date"
                  id="fechaVigenciaInicio"
                  formControlName="fechaVigenciaInicio"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('fechaVigenciaInicio')"
                >
                <div class="invalid-feedback" *ngIf="isFieldInvalid('fechaVigenciaInicio')">
                  La fecha de inicio es obligatoria
                </div>
              </div>

              <div class="form-group">
                <label for="fechaVigenciaFin" class="form-label">Fecha de Fin de Vigencia</label>
                <input 
                  type="date"
                  id="fechaVigenciaFin"
                  formControlName="fechaVigenciaFin"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('fechaVigenciaFin')"
                >
                <div class="invalid-feedback" *ngIf="isFieldInvalid('fechaVigenciaFin')">
                  <span *ngIf="tarifaForm.controls['fechaVigenciaFin'].errors?.['fechaPosterior']">
                    La fecha de fin debe ser posterior a la fecha de inicio
                  </span>
                </div>
                <small class="form-text text-muted">
                  Si no se especifica, la tarifa no tendrá fecha de fin de vigencia.
                </small>
              </div>
            </div>

            <div class="form-group">
              <div class="form-check">
                <input 
                  type="checkbox"
                  id="esVigente"
                  formControlName="esVigente"
                  class="form-check-input"
                >
                <label class="form-check-label" for="esVigente">
                  Tarifa vigente
                </label>
              </div>
              <small class="form-text text-muted">
                Marque esta casilla si la tarifa debe estar activa inmediatamente.
              </small>
            </div>
          </div>

          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              (click)="onCancel()"
              [disabled]="isSubmitting"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="tarifaForm.invalid || isSubmitting"
            >
              <i class="fas fa-spinner fa-spin" *ngIf="isSubmitting"></i>
              {{ editMode ? 'Crear nueva vigencia' : 'Guardar' }}
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
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
    
    .form-modal {
      display: flex;
      flex-direction: column;
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
    }
    
    .modal-header h3 {
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
    
    .btn-close:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .form-label {
      font-weight: 500;
      font-size: 0.9rem;
      color: #495057;
    }
    
    .form-control, .form-select {
      padding: 0.75rem 1rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      background: white;
      font-size: 1rem;
      transition: all 0.2s ease;
    }
    
    .form-control:focus, .form-select:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .form-control:disabled, .form-select:disabled {
      background-color: #e9ecef;
      opacity: 0.7;
    }
    
    .is-invalid {
      border-color: #dc3545;
    }
    
    .is-invalid:focus {
      box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }
    
    .invalid-feedback {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .form-text {
      color: #6c757d;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .required {
      color: #dc3545;
    }
    
    .input-group {
      display: flex;
    }
    
    .input-group-text {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border: 1px solid #ced4da;
      border-right: none;
      border-radius: 4px 0 0 4px;
      background: #e9ecef;
      color: #495057;
      font-size: 1rem;
    }
    
    .input-group .form-control {
      border-radius: 0 4px 4px 0;
    }
    
    .form-check {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    
    .form-check-input {
      width: 1.25rem;
      height: 1.25rem;
      margin-top: 0;
    }
    
    .form-check-label {
      font-size: 1rem;
      color: #495057;
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e9ecef;
      background: #f8f9fa;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #0069d9;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }
    
    .text-info {
      background: #e3f2fd;
      border: 1px solid #2196f3;
      border-radius: 4px;
      padding: 0.75rem;
      margin: 0;
      font-size: 0.9rem;
      color: #1976d2;
    }
    
    .text-info i {
      margin-right: 0.5rem;
    }
    
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TarifaFormComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() tarifa: Tarifa | null = null;
  @Input() tiposVehiculo: TipoVehiculo[] = [];
  @Input() estaciones: Estacion[] = [];
  @Input() isSubmitting: boolean = false;

  @Output() save = new EventEmitter<Partial<Tarifa>>();
  @Output() cancel = new EventEmitter<void>();

  tarifaForm!: FormGroup;
  editMode = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When tarifa input changes, update the form
    if (changes['tarifa'] && this.tarifaForm) {
      this.updateForm();
    }
    
    // When isOpen changes to true, initialize or update the form
    if (changes['isOpen'] && changes['isOpen'].currentValue === true && this.tarifaForm) {
      this.updateForm();
    }
  }

  private initForm(): void {
    this.tarifaForm = this.fb.group({
      id: [null],
      tipoVehiculoId: ['', Validators.required],
      estacionId: [''],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      fechaVigenciaInicio: ['', Validators.required],
      fechaVigenciaFin: [''],
      esVigente: [true]
    }, { validators: this.fechaFinValidator });
  }

  private updateForm(): void {
    this.editMode = !!this.tarifa;
    
    if (this.tarifa) {
      // Set values for editing existing tarifa
      this.tarifaForm.patchValue({
        id: this.tarifa.id,
        tipoVehiculoId: this.tarifa.tipoVehiculoId,
        estacionId: this.tarifa.estacionId || '',
        monto: this.tarifa.monto,
        fechaVigenciaInicio: this.formatDateForInput(this.tarifa.fechaVigenciaInicio),
        fechaVigenciaFin: this.formatDateForInput(this.tarifa.fechaVigenciaFin),
        esVigente: this.tarifa.esVigente
      });
    } else {
      // Reset form for new tarifa
      this.tarifaForm.reset({
        tipoVehiculoId: '',
        estacionId: '',
        monto: '',
        fechaVigenciaInicio: this.formatDateForInput(new Date()),
        fechaVigenciaFin: '',
        esVigente: true
      });
    }
  }

  // Custom validator to ensure fechaVigenciaFin is after fechaVigenciaInicio
  private fechaFinValidator(group: FormGroup): {[key: string]: any} | null {
    const inicio = group.get('fechaVigenciaInicio')?.value;
    const fin = group.get('fechaVigenciaFin')?.value;
    
    if (inicio && fin && new Date(fin) <= new Date(inicio)) {
      group.get('fechaVigenciaFin')?.setErrors({ fechaPosterior: true });
      return { fechaPosterior: true };
    }
    
    // Clear the custom error if validation passes
    if (group.get('fechaVigenciaFin')?.hasError('fechaPosterior')) {
      const errors = { ...group.get('fechaVigenciaFin')?.errors };
      delete errors['fechaPosterior'];
      group.get('fechaVigenciaFin')?.setErrors(Object.keys(errors).length ? errors : null);
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.tarifaForm.valid) {
      const formData = { ...this.tarifaForm.value };
      
      // Convert dates to proper format
      if (formData.fechaVigenciaInicio) {
        formData.fechaVigenciaInicio = new Date(formData.fechaVigenciaInicio);
      }
      
      if (formData.fechaVigenciaFin) {
        formData.fechaVigenciaFin = new Date(formData.fechaVigenciaFin);
      } else {
        formData.fechaVigenciaFin = null;
      }
      
      // Convert estacionId to number or null
      if (formData.estacionId === '') {
        formData.estacionId = null;
      } else {
        formData.estacionId = Number(formData.estacionId);
      }
      
      // Convert tipoVehiculoId to number
      formData.tipoVehiculoId = Number(formData.tipoVehiculoId);
      
      // Emit the save event with the form data
      this.save.emit(formData);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.tarifaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private formatDateForInput(date: Date | string | undefined): string {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}
