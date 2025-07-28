import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TurnoTemplatesService, TurnoTemplate, CreateTurnoTemplateDto, UpdateTurnoTemplateDto } from '@toll-suite/data-access';

@Component({
  selector: 'op-turno-templates',
  template: `
    <div class="templates-container">
      <div class="header">
        <h1>Plantillas de Turnos</h1>
        <button class="btn btn-primary" (click)="showCreateForm = true">
          Crear Nueva Plantilla
        </button>
      </div>

      <!-- Formulario de creación/edición -->
      <div class="form-section" *ngIf="showCreateForm || editingTemplate">
        <h2>{{ editingTemplate ? 'Editar' : 'Crear' }} Plantilla</h2>
        <form [formGroup]="templateForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label for="nombre">Nombre *</label>
              <input id="nombre" type="text" formControlName="nombre" class="form-control">
              <div class="error" *ngIf="templateForm.get('nombre')?.invalid && templateForm.get('nombre')?.touched">
                El nombre es requerido
              </div>
            </div>

            <div class="form-group">
              <label for="descripcion">Descripción</label>
              <textarea id="descripcion" formControlName="descripcion" class="form-control" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label for="horaInicio">Hora Inicio *</label>
              <input id="horaInicio" type="time" formControlName="horaInicio" class="form-control">
            </div>

            <div class="form-group">
              <label for="horaFin">Hora Fin *</label>
              <input id="horaFin" type="time" formControlName="horaFin" class="form-control">
            </div>

            <div class="form-group">
              <label for="factorHoraExtra">Factor Hora Extra</label>
              <input id="factorHoraExtra" type="number" step="0.1" formControlName="factorHoraExtra" class="form-control">
            </div>

            <div class="form-group">
              <label for="diasSemana">Días de la Semana</label>
              <div class="checkbox-group">
                <label><input type="checkbox" value="Lunes" (change)="onDayChange($event)"> Lunes</label>
                <label><input type="checkbox" value="Martes" (change)="onDayChange($event)"> Martes</label>
                <label><input type="checkbox" value="Miércoles" (change)="onDayChange($event)"> Miércoles</label>
                <label><input type="checkbox" value="Jueves" (change)="onDayChange($event)"> Jueves</label>
                <label><input type="checkbox" value="Viernes" (change)="onDayChange($event)"> Viernes</label>
                <label><input type="checkbox" value="Sábado" (change)="onDayChange($event)"> Sábado</label>
                <label><input type="checkbox" value="Domingo" (change)="onDayChange($event)"> Domingo</label>
              </div>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" formControlName="esTurnoNocturno">
                Turno Nocturno
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" formControlName="esRotativo">
                Turno Rotativo
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="templateForm.invalid">
              {{ editingTemplate ? 'Actualizar' : 'Crear' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelEdit()">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Lista de plantillas -->
      <div class="templates-list">
        <div class="search-bar">
          <input type="text" placeholder="Buscar plantillas..." [(ngModel)]="searchTerm" 
                 (input)="filterTemplates()" class="form-control">
        </div>

        <div class="templates-grid">
          <div class="template-card" *ngFor="let template of filteredTemplates">
            <div class="template-header">
              <h3>{{ template.nombre }}</h3>
              <div class="template-actions">
                <button class="btn btn-sm btn-info" (click)="editTemplate(template)">
                  Editar
                </button>
                <button class="btn btn-sm btn-success" (click)="duplicateTemplate(template)">
                  Duplicar
                </button>
                <button class="btn btn-sm" 
                        [ngClass]="template.activo ? 'btn-warning' : 'btn-success'"
                        (click)="toggleTemplate(template)">
                  {{ template.activo ? 'Desactivar' : 'Activar' }}
                </button>
              </div>
            </div>

            <div class="template-details">
              <p><strong>Horario:</strong> {{ template.horaInicio }} - {{ template.horaFin }}</p>
              <p><strong>Duración:</strong> {{ template.duracionPlanificada }} horas</p>
              <p><strong>Días:</strong> {{ template.diasSemana }}</p>
              <p *ngIf="template.descripcion"><strong>Descripción:</strong> {{ template.descripcion }}</p>
              
              <div class="template-badges">
                <span class="badge" *ngIf="template.esTurnoNocturno">Nocturno</span>
                <span class="badge" *ngIf="template.esRotativo">Rotativo</span>
                <span class="badge" [ngClass]="template.activo ? 'badge-success' : 'badge-danger'">
                  {{ template.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .templates-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #3498db;
    }

    .form-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }

    .form-control {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      font-weight: normal;
      margin-bottom: 0;
    }

    .checkbox-group input[type="checkbox"] {
      margin-right: 0.5rem;
    }

    .error {
      color: #e74c3c;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
    }

    .search-bar {
      margin-bottom: 1rem;
    }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1rem;
    }

    .template-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
      transition: transform 0.2s ease;
    }

    .template-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .template-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .template-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .template-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .template-details p {
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }

    .template-badges {
      margin-top: 1rem;
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
      background: #ecf0f1;
      color: #2c3e50;
    }

    .badge-success {
      background: #d4edda;
      color: #155724;
    }

    .badge-danger {
      background: #f8d7da;
      color: #721c24;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
    }

    .btn-primary { background: #3498db; color: white; }
    .btn-primary:hover { background: #2980b9; }
    .btn-primary:disabled { background: #bdc3c7; cursor: not-allowed; }

    .btn-secondary { background: #6c757d; color: white; }
    .btn-secondary:hover { background: #5a6268; }

    .btn-info { background: #17a2b8; color: white; }
    .btn-info:hover { background: #138496; }

    .btn-success { background: #27ae60; color: white; }
    .btn-success:hover { background: #229954; }

    .btn-warning { background: #f39c12; color: white; }
    .btn-warning:hover { background: #e67e22; }
  `]
})
export class TurnoTemplatesComponent implements OnInit {
  templateForm: FormGroup;
  templates: TurnoTemplate[] = [];
  filteredTemplates: TurnoTemplate[] = [];
  showCreateForm = false;
  editingTemplate: TurnoTemplate | null = null;
  searchTerm = '';
  selectedDays: string[] = [];

  constructor(
    private fb: FormBuilder,
    private templatesService: TurnoTemplatesService
  ) {
    this.templateForm = this.createForm();
  }

  ngOnInit() {
    this.loadTemplates();
  }

  createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      factorHoraExtra: [1.5, [Validators.required, Validators.min(1)]],
      esTurnoNocturno: [false],
      esRotativo: [false]
    });
  }

  loadTemplates() {
    this.templatesService.getAll().subscribe({
      next: (response) => {
        this.templates = response.data;
        this.filteredTemplates = [...this.templates];
      },
      error: (error) => {
        console.error('Error al cargar plantillas:', error);
      }
    });
  }

  onSubmit() {
    if (this.templateForm.valid) {
      const formValue = {
        ...this.templateForm.value,
        diasSemana: this.selectedDays.join(',')
      };

      if (this.editingTemplate) {
        this.templatesService.updateTemplate(this.editingTemplate.id, formValue).subscribe({
          next: () => {
            this.loadTemplates();
            this.cancelEdit();
          },
          error: (error) => console.error('Error al actualizar plantilla:', error)
        });
      } else {
        this.templatesService.createTemplate(formValue).subscribe({
          next: () => {
            this.loadTemplates();
            this.cancelEdit();
          },
          error: (error) => console.error('Error al crear plantilla:', error)
        });
      }
    }
  }

  editTemplate(template: TurnoTemplate) {
    this.editingTemplate = template;
    this.showCreateForm = true;
    this.selectedDays = template.diasSemana ? template.diasSemana.split(',') : [];
    
    this.templateForm.patchValue({
      nombre: template.nombre,
      descripcion: template.descripcion,
      horaInicio: template.horaInicio,
      horaFin: template.horaFin,
      factorHoraExtra: template.factorHoraExtra,
      esTurnoNocturno: template.esTurnoNocturno,
      esRotativo: template.esRotativo
    });
  }

  duplicateTemplate(template: TurnoTemplate) {
    const newName = prompt('Nombre para la plantilla duplicada:', `${template.nombre} - Copia`);
    if (newName) {
      this.templatesService.duplicateTemplate(template.id, newName).subscribe({
        next: () => this.loadTemplates(),
        error: (error) => console.error('Error al duplicar plantilla:', error)
      });
    }
  }

  toggleTemplate(template: TurnoTemplate) {
    const updateData: UpdateTurnoTemplateDto = { activo: !template.activo };
    this.templatesService.updateTemplate(template.id, updateData).subscribe({
      next: () => this.loadTemplates(),
      error: (error) => console.error('Error al cambiar estado:', error)
    });
  }

  cancelEdit() {
    this.showCreateForm = false;
    this.editingTemplate = null;
    this.templateForm.reset();
    this.selectedDays = [];
    this.templateForm = this.createForm();
  }

  onDayChange(event: any) {
    const day = event.target.value;
    if (event.target.checked) {
      this.selectedDays.push(day);
    } else {
      this.selectedDays = this.selectedDays.filter(d => d !== day);
    }
  }

  filterTemplates() {
    if (!this.searchTerm) {
      this.filteredTemplates = [...this.templates];
    } else {
      this.filteredTemplates = this.templates.filter(template =>
        template.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (template.descripcion && template.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
  }
}
