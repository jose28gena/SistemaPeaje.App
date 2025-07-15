import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'actions';
  width?: string;
  format?: (value: any) => string;
}

export interface TableAction {
  icon: string;
  label: string;
  action: string;
  color?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  disabled?: (item: any) => boolean;
  visible?: (item: any) => boolean;
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-data-table',
  template: `
    <div class="data-table-container">
      <div class="table-header" *ngIf="showHeader">
        <div class="table-controls">
          <div class="search-box" *ngIf="searchable">
            <input 
              type="text" 
              placeholder="Buscar..." 
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
              class="search-input"
            >
            <i class="fas fa-search search-icon"></i>
          </div>
          
          <div class="table-actions">
            <button 
              *ngIf="showAddButton" 
              (click)="onAdd()" 
              class="btn btn-primary"
            >
              <i class="fas fa-plus"></i>
              Agregar
            </button>
            
            <button 
              *ngIf="showRefreshButton" 
              (click)="onRefresh()" 
              class="btn btn-secondary"
            >
              <i class="fas fa-sync-alt"></i>
              Actualizar
            </button>
          </div>
        </div>
      </div>
      
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th 
                *ngFor="let column of columns" 
                [style.width]="column.width"
                [class.sortable]="column.sortable"
                (click)="column.sortable ? toggleSort(column.key) : null"
              >
                {{ column.label }}
                <i 
                  *ngIf="column.sortable && sortColumn === column.key" 
                  class="fas"
                  [class.fa-sort-up]="sortDirection === 'asc'"
                  [class.fa-sort-down]="sortDirection === 'desc'"
                ></i>
                <i 
                  *ngIf="column.sortable && sortColumn !== column.key" 
                  class="fas fa-sort"
                ></i>
              </th>
            </tr>
          </thead>
          
          <tbody>
            <tr *ngIf="loading" class="loading-row">
              <td [attr.colspan]="columns.length">
                <div class="loading-spinner">
                  <i class="fas fa-spinner fa-spin"></i>
                  Cargando...
                </div>
              </td>
            </tr>
            
            <tr *ngIf="!loading && filteredData.length === 0" class="no-data-row">
              <td [attr.colspan]="columns.length">
                <div class="no-data">
                  <i class="fas fa-inbox"></i>
                  No hay datos disponibles
                </div>
              </td>
            </tr>
            
            <tr *ngFor="let item of paginatedData; let i = index" [class.active]="item === selectedItem">
              <td *ngFor="let column of columns" [class]="'col-' + column.type">
                <ng-container [ngSwitch]="column.type">
                  <span *ngSwitchCase="'boolean'">
                    <i class="fas" [class.fa-check]="getValue(item, column.key)" [class.fa-times]="!getValue(item, column.key)"></i>
                  </span>
                  <span *ngSwitchCase="'date'">
                    {{ getValue(item, column.key) | date:'short' }}
                  </span>
                  <span *ngSwitchCase="'currency'">
                    {{ getValue(item, column.key) | currency:'USD':'symbol':'1.2-2' }}
                  </span>
                  <div *ngSwitchCase="'actions'" class="table-actions-cell">
                    <button 
                      *ngFor="let action of actions" 
                      [class]="'btn btn-sm btn-' + (action.color || 'primary')"
                      [disabled]="action.disabled ? action.disabled(item) : false"
                      [style.display]="action.visible ? (action.visible(item) ? 'inline-block' : 'none') : 'inline-block'"
                      (click)="onAction(action.action, item)"
                      [title]="action.label"
                    >
                      <i [class]="action.icon"></i>
                    </button>
                  </div>
                  <span *ngSwitchDefault>
                    {{ column.format ? column.format(getValue(item, column.key)) : getValue(item, column.key) }}
                  </span>
                </ng-container>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="table-footer" *ngIf="showPagination && !loading">
        <div class="pagination-info">
          Mostrando {{ startIndex + 1 }} - {{ endIndex }} de {{ filteredData.length }} registros
        </div>
        
        <div class="pagination-controls">
          <button 
            class="btn btn-sm btn-secondary" 
            [disabled]="currentPage === 1"
            (click)="goToPage(1)"
          >
            <i class="fas fa-angle-double-left"></i>
          </button>
          
          <button 
            class="btn btn-sm btn-secondary" 
            [disabled]="currentPage === 1"
            (click)="goToPage(currentPage - 1)"
          >
            <i class="fas fa-angle-left"></i>
          </button>
          
          <span class="page-info">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
          
          <button 
            class="btn btn-sm btn-secondary" 
            [disabled]="currentPage === totalPages"
            (click)="goToPage(currentPage + 1)"
          >
            <i class="fas fa-angle-right"></i>
          </button>
          
          <button 
            class="btn btn-sm btn-secondary" 
            [disabled]="currentPage === totalPages"
            (click)="goToPage(totalPages)"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .data-table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .table-header {
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
      background: #f8f9fa;
    }
    
    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .search-box {
      position: relative;
      width: 300px;
    }
    
    .search-input {
      width: 100%;
      padding: 0.5rem 2.5rem 0.5rem 1rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    
    .search-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
    }
    
    .table-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .table-wrapper {
      overflow-x: auto;
      max-height: 600px;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .data-table th,
    .data-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }
    
    .data-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .data-table th.sortable {
      cursor: pointer;
      user-select: none;
    }
    
    .data-table th.sortable:hover {
      background: #e9ecef;
    }
    
    .data-table tbody tr:hover {
      background: #f8f9fa;
    }
    
    .data-table tbody tr.active {
      background: #e3f2fd;
    }
    
    .loading-row,
    .no-data-row {
      text-align: center;
    }
    
    .loading-spinner,
    .no-data {
      padding: 2rem;
      color: #6c757d;
    }
    
    .loading-spinner i {
      margin-right: 0.5rem;
    }
    
    .table-actions-cell {
      display: flex;
      gap: 0.25rem;
    }
    
    .table-footer {
      padding: 1rem;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .pagination-info {
      color: #6c757d;
      font-size: 0.9rem;
    }
    
    .pagination-controls {
      display: flex;
      gap: 0.25rem;
      align-items: center;
    }
    
    .page-info {
      margin: 0 0.5rem;
      color: #6c757d;
      font-size: 0.9rem;
    }
    
    .btn {
      padding: 0.375rem 0.75rem;
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
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
      border-color: #0056b3;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
      border-color: #6c757d;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: #545b62;
      border-color: #545b62;
    }
    
    .btn-danger {
      background: #dc3545;
      color: white;
      border-color: #dc3545;
    }
    
    .btn-danger:hover:not(:disabled) {
      background: #c82333;
      border-color: #c82333;
    }
    
    .btn-warning {
      background: #ffc107;
      color: #212529;
      border-color: #ffc107;
    }
    
    .btn-warning:hover:not(:disabled) {
      background: #e0a800;
      border-color: #e0a800;
    }
    
    .btn-success {
      background: #28a745;
      color: white;
      border-color: #28a745;
    }
    
    .btn-success:hover:not(:disabled) {
      background: #218838;
      border-color: #218838;
    }
    
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
    }
    
    .col-boolean {
      text-align: center;
      width: 60px;
    }
    
    .col-actions {
      width: 120px;
    }
    
    .col-date {
      width: 140px;
    }
    
    .col-currency {
      text-align: right;
      width: 100px;
    }
    
    @media (max-width: 768px) {
      .table-controls {
        flex-direction: column;
        gap: 1rem;
      }
      
      .search-box {
        width: 100%;
      }
      
      .table-footer {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() loading = false;
  @Input() searchable = true;
  @Input() showHeader = true;
  @Input() showAddButton = true;
  @Input() showRefreshButton = true;
  @Input() showPagination = true;
  @Input() pageSize = 10;
  @Input() selectedItem: any = null;
  
  @Output() search = new EventEmitter<string>();
  @Output() sort = new EventEmitter<SortEvent>();
  @Output() actionClick = new EventEmitter<{action: string, item: any}>();
  @Output() addClick = new EventEmitter<void>();
  @Output() refreshClick = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  
  searchTerm = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  filteredData: any[] = [];
  paginatedData: any[] = [];
  
  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }
  
  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }
  
  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.filteredData.length);
  }
  
  ngOnInit() {
    this.updateTable();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.updateTable();
    }
  }
  
  onSearch() {
    this.search.emit(this.searchTerm);
    this.filterData();
  }
  
  onAdd() {
    this.addClick.emit();
  }
  
  onRefresh() {
    this.refreshClick.emit();
  }
  
  onAction(action: string, item: any) {
    this.actionClick.emit({ action, item });
  }
  
  toggleSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.sort.emit({ column, direction: this.sortDirection });
    this.sortData();
  }
  
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChange.emit(page);
      this.updatePagination();
    }
  }
  
  getValue(item: any, key: string): any {
    return key.split('.').reduce((obj, prop) => obj?.[prop], item);
  }
  
  private updateTable() {
    this.filterData();
    this.sortData();
    this.updatePagination();
  }
  
  private filterData() {
    if (!this.searchTerm) {
      this.filteredData = [...this.data];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredData = this.data.filter(item => 
        this.columns.some(column => {
          const value = this.getValue(item, column.key);
          return value?.toString().toLowerCase().includes(term);
        })
      );
    }
    
    this.currentPage = 1;
  }
  
  private sortData() {
    if (!this.sortColumn) return;
    
    this.filteredData.sort((a, b) => {
      const aValue = this.getValue(a, this.sortColumn);
      const bValue = this.getValue(b, this.sortColumn);
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  private updatePagination() {
    const start = this.startIndex;
    const end = this.endIndex;
    this.paginatedData = this.filteredData.slice(start, end);
  }
}
