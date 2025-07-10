# Sistema de Peaje - Toll Suite

Un sistema completo de gestión de peaje con dos aplicaciones Angular PWA:

## 🏗️ Arquitectura del Proyecto

```
toll-suite/
├─ projects/
│   ├─ operator-panel/          # Panel de operador
│   │   ├─ src/
│   │   │   ├─ app/
│   │   │   │   ├─ core/        # Servicios singleton, guards
│   │   │   │   ├─ features/
│   │   │   │   │   ├─ dashboard/     # Dashboard operador
│   │   │   │   │   ├─ lane-control/  # Control de carriles
│   │   │   │   │   └─ settings/      # Configuración
│   │   │   │   ├─ shared/      # Componentes específicos
│   │   │   │   └─ app-routing.module.ts
│   │   │   └─ environments/
│   │   └─ manifest.json        # PWA manifest
│   │
│   └─ reports-dashboard/       # Panel de administrador
│       ├─ src/
│       │   ├─ app/
│       │   │   ├─ core/
│       │   │   ├─ features/
│       │   │   │   ├─ reports/    # Reportes
│       │   │   │   ├─ analytics/  # Análisis
│       │   │   │   └─ admin/      # Administración
│       │   │   └─ shared/
│       │   └─ environments/
│       └─ manifest.json
│
├─ libs/
│   ├─ ui-kit/                  # Componentes UI reutilizables
│   │   └─ src/lib/components/
│   │       ├─ toll-card/       # Tarjeta de métrica
│   │       ├─ lane-status/     # Estado del carril
│   │       └─ metric-display/  # Display de métricas
│   │
│   └─ data-access/             # Servicios de datos
│       └─ src/lib/
│           ├─ services/        # API services
│           └─ models/          # Modelos de datos
│
├─ angular.json                 # Configuración Angular
├─ package.json                 # Dependencias
└─ tsconfig.json               # Configuración TypeScript
```

## 🚀 Aplicaciones

### Panel de Operador (Puerto 4200)
- **Dashboard**: Vista general del estado del sistema
- **Control de Carriles**: Gestión en tiempo real de carriles
- **Configuración**: Ajustes del panel de operador

### Dashboard de Reportes (Puerto 4201)
- **Reportes**: Generación y visualización de reportes
- **Análisis**: Dashboard analítico con métricas
- **Administración**: Gestión del sistema

## 📦 Librerías Compartidas

### UI Kit
Componentes de interfaz reutilizables:
- `TollCardComponent`: Tarjetas de métricas
- `LaneStatusComponent`: Indicador de estado de carril
- `MetricDisplayComponent`: Display de métricas con tendencias

### Data Access
Servicios y modelos compartidos:
- Servicios de API
- Modelos de datos
- Interceptors HTTP

## 🛠️ Scripts Disponibles

### Desarrollo
```bash
# Instalar dependencias
npm install

# Ejecutar panel de operador
npm run start:operator

# Ejecutar dashboard de reportes
npm run start:dashboard

# Ejecutar ambas aplicaciones
npm run start
```

### Construcción
```bash
# Build panel de operador
npm run build:operator

# Build dashboard de reportes
npm run build:dashboard

# Build producción (ambas apps)
npm run build:prod
```

### Testing
```bash
# Test panel de operador
npm run test:operator

# Test dashboard de reportes
npm run test:dashboard

# Test todas las aplicaciones
npm run test
```

## 🔧 Tecnologías

- **Angular 17**: Framework principal
- **Angular Material**: Componentes UI
- **PWA**: Progressive Web App
- **Service Workers**: Cache y funcionalidad offline
- **TypeScript**: Lenguaje de programación
- **SCSS**: Estilos

## 📱 Características PWA

Ambas aplicaciones están configuradas como PWA:
- ✅ Instalables en dispositivos
- ✅ Funcionalidad offline
- ✅ Service Workers
- ✅ Manifiestos web
- ✅ Iconos adaptativos

## 🏃‍♂️ Primeros Pasos

1. **Instalar dependencias**:
   ```bash
   cd toll-suite
   npm install
   ```

2. **Ejecutar en desarrollo**:
   ```bash
   # Panel de operador en puerto 4200
   npm run start:operator
   
   # Dashboard de reportes en puerto 4201
   npm run start:dashboard
   ```

3. **Acceder a las aplicaciones**:
   - Panel de Operador: http://localhost:4200
   - Dashboard de Reportes: http://localhost:4201

## 🔐 Configuración

### Variables de Entorno
- `environment.ts`: Configuración de desarrollo
- `environment.prod.ts`: Configuración de producción

### Personalización
- Modifica los temas en los archivos de estilos
- Ajusta las rutas en `app-routing.module.ts`
- Configura la API en los servicios de `data-access`

## 📄 Próximos Pasos

1. Implementar autenticación y autorización
2. Agregar tests unitarios y e2e
3. Configurar CI/CD
4. Implementar notificaciones push
5. Agregar más características analíticas
