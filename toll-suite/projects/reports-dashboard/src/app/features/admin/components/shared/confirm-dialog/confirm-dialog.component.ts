import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="onBackdropClick()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">{{ title }}</h4>
            <button type="button" class="close" (click)="onCancel()">
              <span>&times;</span>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="confirm-content">
              <i class="fas fa-exclamation-triangle warning-icon"></i>
              <p>{{ message }}</p>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">
              {{ cancelText }}
            </button>
            <button type="button" class="btn btn-danger" (click)="onConfirm()">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    }
    
    .modal-dialog {
      max-width: 500px;
      width: 90%;
      margin: 0 auto;
    }
    
    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .modal-header {
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
    }
    
    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6c757d;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .close:hover {
      color: #000;
    }
    
    .modal-body {
      padding: 1.5rem;
    }
    
    .confirm-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .warning-icon {
      font-size: 2rem;
      color: #ffc107;
      flex-shrink: 0;
    }
    
    .confirm-content p {
      margin: 0;
      font-size: 1rem;
      color: #495057;
    }
    
    .modal-footer {
      padding: 1rem;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      background: #f8f9fa;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border: 1px solid transparent;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
      border-color: #6c757d;
    }
    
    .btn-secondary:hover {
      background: #545b62;
      border-color: #545b62;
    }
    
    .btn-danger {
      background: #dc3545;
      color: white;
      border-color: #dc3545;
    }
    
    .btn-danger:hover {
      background: #c82333;
      border-color: #c82333;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Está seguro de que desea continuar?';
  @Input() confirmText = 'Sí, eliminar';
  @Input() cancelText = 'Cancelar';
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  
  onConfirm() {
    this.confirm.emit();
  }
  
  onCancel() {
    this.cancel.emit();
  }
  
  onBackdropClick() {
    this.onCancel();
  }
}
