import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'rd-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport="true" mode="side" opened="true">
        <mat-toolbar>Admin Dashboard</mat-toolbar>
        <mat-nav-list>
          <a mat-list-item routerLink="/reports">
            <mat-icon>assessment</mat-icon>
            <span>Reportes</span>
          </a>
          <a mat-list-item routerLink="/analytics">
            <mat-icon>analytics</mat-icon>
            <span>Análisis</span>
          </a>
          <a mat-list-item routerLink="/admin">
            <mat-icon>admin_panel_settings</mat-icon>
            <span>Administración</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button type="button" mat-icon-button (click)="drawer.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span>Sistema de Peaje - Dashboard Administrativo</span>
          <span class="spacer"></span>
          <mat-icon>account_circle</mat-icon>
        </mat-toolbar>
        
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }

    .sidenav {
      width: 250px;
    }

    .content {
      padding: 20px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    mat-toolbar {
      background-color: #3f51b5;
      color: white;
    }
  `]
})
export class AppComponent {
  title = 'reports-dashboard';
}
