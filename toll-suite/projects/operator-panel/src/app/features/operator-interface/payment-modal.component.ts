import { Component, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface PaymentModalData {
  selectedClass: any;
  baseRate: number;
  tax: number;
  total: number;
  paymentMethods: any[];
}

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="payment-modal">
      <div mat-dialog-title class="modal-header">
        <mat-icon>payment</mat-icon>
        <h2>Panel de Cobro</h2>
      </div>
      
      <div mat-dialog-content class="modal-content">
        <!-- Rate Information -->
        <div class="rate-section">
          <div class="rate-details">
            <div class="rate-line">
              <span class="label">Clase:</span>
              <span class="value">{{ data.selectedClass?.name || '-' }}</span>
            </div>
            <div class="rate-line">
              <span class="label">Tarifa base:</span>
              <span class="value">\${{ data.baseRate | number:'1.2-2' }}</span>
            </div>
            <div class="rate-line">
              <span class="label">IVA:</span>
              <span class="value">\${{ data.tax | number:'1.2-2' }}</span>
            </div>
            <mat-divider></mat-divider>
            <div class="rate-line total">
              <span class="label">Total:</span>
              <span class="value">\${{ data.total | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="payment-methods">
          <h4>Método de pago:</h4>
          <div class="payment-buttons">
            <button 
              mat-raised-button 
              *ngFor="let method of data.paymentMethods"
              [color]="selectedPaymentMethod === method.id ? 'primary' : ''"
              (click)="selectPaymentMethod(method.id)"
              [matTooltip]="'Atajo: ' + method.hotkey"
              class="payment-button">
              <span class="hotkey">[{{ method.hotkey }}]</span>
              {{ method.name }}
            </button>
          </div>
        </div>

        <!-- Payment Details -->
        <div class="payment-details" *ngIf="selectedPaymentMethod === 'cash'">
          <mat-form-field appearance="outline" class="amount-field">
            <mat-label>Importe recibido</mat-label>
            <input #cashInput matInput type="text" inputmode="decimal" 
                   pattern="[0-9]*[.,]?[0-9]*" 
                   [(ngModel)]="receivedBuffer" 
                   (ngModelChange)="onCashBufferChange()" 
                   (keydown.enter)="processPayment()" 
                   (keydown.escape)="cancel()">
            <span matPrefix>\$</span>
          </mat-form-field>
          
          <div class="quick-cash">
            <button mat-stroked-button (click)="applyQuickCash('exact')">Exacto</button>
            <button mat-stroked-button (click)="applyQuickCash('add10')">+10</button>
            <button mat-stroked-button (click)="applyQuickCash('add20')">+20</button>
          </div>
          
          <div class="numpad">
            <button mat-raised-button class="nkey" *ngFor="let k of numpadKeys" (click)="onNumpad(k)">{{ k }}</button>
            <button mat-raised-button class="nkey wide" (click)="onNumpad('clear')">Limpiar</button>
            <button mat-raised-button class="nkey" (click)="onNumpad('back')">⌫</button>
          </div>
          
          <div class="change-amount" *ngIf="change !== null">
            <span class="label">Cambio:</span>
            <span class="value" [class.negative]="change < 0">\${{ change | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <div mat-dialog-actions class="modal-actions">
        <button mat-button (click)="cancel()">
          <mat-icon>cancel</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button color="primary" 
                [disabled]="!canProcess() || isProcessing"
                (click)="processPayment()">
          <mat-icon>payment</mat-icon>
          PROCESAR
        </button>
      </div>
    </div>
  `,
  styles: [`
    .payment-modal {
      width: 600px;
      max-width: 90vw;
      max-height: 90vh;
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--primary-color, #1976d2);
      
      h2 {
        margin: 0;
        font-size: 1.5rem;
      }
    }

    .modal-content {
      padding: 20px 0;
    }

    .rate-section {
      margin-bottom: 24px;
      
      .rate-details {
        background: var(--surface-color, #f5f5f5);
        padding: 16px;
        border-radius: 8px;
        
        .rate-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          
          &.total {
            font-weight: 600;
            font-size: 1.1rem;
            color: var(--primary-color, #1976d2);
            margin-top: 8px;
          }
          
          .label {
            color: var(--text-secondary, #666);
          }
          
          .value {
            font-weight: 500;
          }
        }
      }
    }

    .payment-methods {
      margin-bottom: 24px;
      
      h4 {
        margin: 0 0 12px 0;
        color: var(--text-primary, #333);
      }
      
      .payment-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        
        .payment-button {
          flex: 1;
          min-width: 120px;
          height: 48px;
          
          .hotkey {
            font-size: 0.8rem;
            opacity: 0.7;
            margin-right: 8px;
          }
        }
      }
    }

    .payment-details {
      .amount-field {
        width: 100%;
        margin-bottom: 16px;
      }
      
      .quick-cash {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        
        button {
          flex: 1;
          height: 36px;
        }
      }
      
      .numpad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-bottom: 16px;
        
        .nkey {
          height: 48px;
          font-size: 1.1rem;
          
          &.wide {
            grid-column: span 2;
          }
        }
      }
      
      .change-amount {
        display: flex;
        justify-content: space-between;
        padding: 12px;
        background: var(--accent-color, #ffc107);
        border-radius: 8px;
        font-weight: 600;
        
        .value.negative {
          color: #d32f2f;
        }
      }
    }

    .modal-actions {
      padding-top: 16px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      
      button {
        min-width: 120px;
        height: 44px;
      }
    }
  `]
})
export class PaymentModalComponent implements AfterViewInit {
  @ViewChild('cashInput') cashInput!: ElementRef<HTMLInputElement>;

  selectedPaymentMethod: string = '';
  receivedBuffer: string = '';
  receivedAmount: number = 0;
  change: number | null = null;
  isProcessing: boolean = false;

  numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '.'];

  constructor(
    public dialogRef: MatDialogRef<PaymentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentModalData
  ) {}

  ngAfterViewInit() {
    // Auto-focus cash input after a brief delay
    setTimeout(() => {
      if (this.cashInput?.nativeElement) {
        this.cashInput.nativeElement.focus();
      }
    }, 200);
  }

  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod = method;
    if (method === 'cash' && this.cashInput?.nativeElement) {
      setTimeout(() => this.cashInput.nativeElement.focus(), 100);
    }
  }

  onCashBufferChange() {
    const cleaned = this.receivedBuffer.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    this.receivedAmount = isNaN(parsed) ? 0 : parsed;
    this.change = this.receivedAmount > 0 ? this.receivedAmount - this.data.total : null;
  }

  applyQuickCash(type: string) {
    switch (type) {
      case 'exact':
        this.receivedBuffer = this.data.total.toFixed(2);
        break;
      case 'add10':
        this.receivedBuffer = (this.data.total + 10).toFixed(2);
        break;
      case 'add20':
        this.receivedBuffer = (this.data.total + 20).toFixed(2);
        break;
    }
    this.onCashBufferChange();
  }

  onNumpad(key: string) {
    if (key === 'clear') {
      this.receivedBuffer = '';
    } else if (key === 'back') {
      this.receivedBuffer = this.receivedBuffer.slice(0, -1);
    } else {
      this.receivedBuffer += key;
    }
    this.onCashBufferChange();
  }

  canProcess(): boolean {
    if (!this.selectedPaymentMethod) return false;
    if (this.selectedPaymentMethod === 'cash') {
      return this.receivedAmount >= this.data.total;
    }
    return true; // For card payments
  }

  processPayment() {
    if (!this.canProcess() || this.isProcessing) return;
    
    this.isProcessing = true;
    
    const result = {
      method: this.selectedPaymentMethod,
      amount: this.data.total,
      received: this.receivedAmount,
      change: this.change
    };
    
    this.dialogRef.close(result);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
