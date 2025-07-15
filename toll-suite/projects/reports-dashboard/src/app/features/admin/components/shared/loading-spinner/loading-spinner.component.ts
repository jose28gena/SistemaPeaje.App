import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="loading-spinner" [class.overlay]="overlay">
      <div class="spinner-content">
        <div class="spinner">
          <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .loading-spinner.overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      z-index: 1000;
    }
    
    .spinner-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .spinner-border {
      width: 3rem;
      height: 3rem;
      border: 0.25rem solid #f3f3f3;
      border-top: 0.25rem solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .loading-message {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }
    
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message = 'Cargando...';
  @Input() overlay = false;
}
