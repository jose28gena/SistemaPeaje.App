import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'op-root',
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
        <mat-toolbar>Panel Operador</mat-toolbar>
        <mat-nav-list>
          <a mat-list-item routerLink="/operator">
            <mat-icon>assignment_ind</mat-icon>
            <span>Interfaz Operador</span>
          </a>
          <a mat-list-item routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/lane-control">
            <mat-icon>traffic</mat-icon>
            <span>Control de Carriles</span>
          </a>
          <a mat-list-item routerLink="/settings">
            <mat-icon>settings</mat-icon>
            <span>Configuración</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button type="button" mat-icon-button (click)="drawer.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span>Sistema de Peaje - Operador</span>
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
      background-color: #1976d2;
      color: white;
    }
  `]
})
export class AppComponent {
  title = 'operator-panel';
}
