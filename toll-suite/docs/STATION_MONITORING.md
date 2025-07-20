# Pantalla de Monitoreo de Estaciones - Sistema de Peaje

## 📋 Descripción

Se ha implementado una nueva pantalla de administrador para el monitoreo en tiempo real de las estaciones de trabajo (PLCs) que se actualizan automáticamente mediante el worker service del backend.

## 🎯 Funcionalidades Implementadas

### 1. **Monitoreo en Tiempo Real**
- **Actualización automática** configurable (2, 5, 10, 30 segundos)
- **Estado de conexión** de cada PLC en tiempo real
- **Visualización de coils** activos por estación
- **Detección de alarmas** automática

### 2. **Dashboard de Resumen**
- **Contadores dinámicos** de estaciones:
  - Conectadas
  - Desconectadas  
  - Con alarmas activas
  - Total de estaciones
- **Indicadores visuales** con códigos de color

### 3. **Gestión de Estaciones**
- **Activar/Desactivar** estaciones individual
- **Reiniciar workers** de PLCs problemáticos
- **Probar conexión** manual de estaciones
- **Ver detalles** expandidos de cada PLC

### 4. **Estados de Estaciones**
- 🟢 **Conectado**: PLC respondiendo correctamente
- 🔴 **Desconectado**: Sin comunicación con el PLC
- 🟡 **Iniciando**: Worker en proceso de inicio
- 🟣 **Error**: Problemas en el worker
- ⚪ **Detenido**: Worker no activo

## 🏗️ Arquitectura Implementada

### **Frontend (Angular)**
```
projects/reports-dashboard/src/app/features/admin/
├── components/
│   ├── station-monitoring.component.ts    # Componente principal
│   └── station-monitoring.module.ts       # Módulo con dependencias
└── services/
    └── station-monitoring.service.ts      # Servicio para API calls
```

### **Backend (API)**
```
Controllers/PlcConfiguracionController.cs
└── GET /api/PlcConfiguracion/with-coils   # Endpoint para datos completos
└── GET /api/PlcConfiguracion/workers/status  # Estado de workers
```

## 🔧 Servicios Implementados

### **StationMonitoringService**
```typescript
// Obtener configuraciones con coils
getPlcConfigurations(): Observable<PlcConfiguration[]>

// Estado de workers en tiempo real
getWorkersStatus(): Observable<WorkerStatus>

// Datos combinados con auto-refresh
getStationMonitoringData(interval: number): Observable<StationMonitoringData>

// Acciones sobre estaciones
testPlcConnection(id: number): Observable<{connected: boolean, message: string}>
restartWorker(configId: number): Observable<any>
updatePlcStatus(id: number, active: boolean): Observable<any>
```

## 📊 Interfaces de Datos

### **PlcConfiguration**
```typescript
interface PlcConfiguration {
  id: number;
  nombre: string;
  ip: string;
  puerto: number;
  estacionId: number;
  carrilId: number;
  estaConectado: boolean;
  ultimaConexion?: string;
  activo: boolean;
  coilsConfiguracion: CoilConfiguration[];
}
```

### **WorkerStatus**
```typescript
interface WorkerStatus {
  [configId: string]: 'Conectado' | 'Desconectado' | 'Iniciando' | 'Error' | 'Detenido';
}
```

## 🚀 Cómo Usar

### **1. Acceso a la Pantalla**
- Navegar a `/admin/station-monitoring` en el dashboard de reportes
- El enlace aparece como "Monitoreo de Estaciones" en el menú del admin

### **2. Configurar Actualización**
- Seleccionar intervalo de actualización (2-30 segundos)
- Los datos se actualizan automáticamente sin recargar la página

### **3. Gestionar Estaciones**
- **Toggle**: Activar/desactivar estación
- **Probar**: Verificar conectividad manual
- **Reiniciar**: Restart del worker problemático
- **Detalles**: Ver información expandida

### **4. Monitorear Estados**
- **Resumen visual** en la parte superior
- **Tarjetas detalladas** por cada estación
- **Estados de coils** individuales
- **Alertas de alarmas** destacadas

## 🎨 Características UI/UX

### **Responsive Design**
- **Grid adaptativo** para diferentes pantallas
- **Mobile-friendly** con layout vertical en móviles

### **Indicadores Visuales**
- **Colores por estado**: Verde (OK), Rojo (Error), Amarillo (Advertencia)
- **Iconos descriptivos**: Material Design icons
- **Animaciones sutiles**: Hover effects y transitions

### **Notificaciones**
- **Snackbars coloreados** para feedback de acciones
- **Mensajes informativos** de estado de operaciones

## 🔧 Configuración Requerida

### **Environment**
```typescript
// src/environments/environment.ts
export const environment = {
  apiUrl: 'https://localhost:51393/api'  // URL de la API backend
};
```

### **Estilos Globales**
```scss
// Agregados a styles.scss
.success-snackbar { background-color: #4caf50 !important; }
.error-snackbar { background-color: #f44336 !important; }
.warning-snackbar { background-color: #ff9800 !important; }
```

## 📋 Dependencias Angular Material

El módulo utiliza los siguientes componentes de Material:
- `MatCardModule` - Tarjetas de estaciones
- `MatButtonModule` - Botones de acción
- `MatIconModule` - Iconografía
- `MatFormFieldModule` + `MatSelectModule` - Selector de intervalo
- `MatProgressSpinnerModule` - Loading spinner
- `MatSlideToggleModule` - Toggle activar/desactivar
- `MatSnackBarModule` - Notificaciones

## 🚀 Próximas Mejoras

### **Funcionalidades Planeadas**
- **Histórico de conexiones** por estación
- **Gráficos de tendencias** de disponibilidad
- **Alertas configurables** por email/SMS
- **Exportación de reportes** de monitoreo
- **Vista detallada** por estación individual
- **Configuración de umbrales** de alarma

### **Optimizaciones Técnicas**
- **WebSocket integration** para updates en tiempo real
- **Caching inteligente** de datos de configuración
- **Lazy loading** para componentes pesados
- **Service Worker** para funcionalidad offline

## 🔗 Integración con Worker Service

La pantalla se integra directamente con:
- **PlcManagerService**: Gestión dinámica de workers
- **PlcWorkerInstance**: Instancias individuales de PLCs
- **PlcModbusReaderService**: Lectura de coils vía Modbus TCP

## 💡 Notas de Implementación

1. **Auto-refresh**: Utiliza RxJS interval + switchMap para actualizaciones eficientes
2. **Error handling**: Manejo robusto de errores de red y timeouts
3. **Performance**: TrackBy functions para optimizar re-renders
4. **Accessibility**: Iconos descriptivos y textos alternativos
5. **Type Safety**: Interfaces TypeScript completas para todos los datos

---

**Desarrollado para Sistema de Peaje** 🚧  
*Monitoreo en tiempo real de estaciones PLC con workers automáticos*
