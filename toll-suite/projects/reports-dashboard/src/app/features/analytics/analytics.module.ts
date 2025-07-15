import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-analytics-overview',
  template: `
    <div class="analytics-page">
      <div class="page-header">
        <h1>Analítica</h1>
        <p>Análisis y métricas del sistema</p>
      </div>
      
      <div class="coming-soon">
        <i class="fas fa-chart-line"></i>
        <h3>Próximamente</h3>
        <p>Esta funcionalidad estará disponible pronto</p>
      </div>
    </div>
  `,
  styles: [`
    .analytics-page {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .page-header {
      margin-bottom: 2rem;
    }
    
    .page-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .page-header p {
      margin: 0;
      color: #6c757d;
      font-size: 1.1rem;
    }
    
    .coming-soon {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .coming-soon i {
      font-size: 4rem;
      color: #6c757d;
      margin-bottom: 1rem;
    }
    
    .coming-soon h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
    }
    
    .coming-soon p {
      margin: 0;
      color: #6c757d;
    }
  `]
})
export class AnalyticsOverviewComponent {}

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: AnalyticsOverviewComponent },
      { path: '**', redirectTo: 'overview' }
    ])
  ],
  declarations: [
    AnalyticsOverviewComponent
  ]
})
export class AnalyticsModule { }
