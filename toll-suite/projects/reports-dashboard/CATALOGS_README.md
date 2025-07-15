# Sistema de Catálogos - Reports Dashboard

Este módulo implementa la gestión completa de catálogos para el sistema de peaje, proporcionando una interfaz administrativa para manejar todas las entidades del sistema.

## Estructura del Proyecto

```
reports-dashboard/src/app/features/admin/
├── components/
│   ├── admin-layout/                    # Layout principal del módulo de administración
│   └── shared/                          # Componentes compartidos
│       ├── data-table/                  # Tabla de datos reutilizable
│       ├── confirm-dialog/              # Diálogo de confirmación
│       └── loading-spinner/             # Indicador de carga
├── pages/                               # Páginas de catálogos
│   ├── estaciones/                      # Gestión de estaciones
│   ├── carriles/                        # Gestión de carriles
│   ├── tipos-vehiculo/                  # Gestión de tipos de vehículo
│   ├── tipos-pago/                      # Gestión de tipos de pago
│   ├── tipos-cliente/                   # Gestión de tipos de cliente
│   ├── tarifas/                         # Gestión de tarifas
│   ├── clientes/                        # Gestión de clientes
│   ├── empleados/                       # Gestión de empleados
│   ├── tarjetas-rfid/                   # Gestión de tarjetas RFID
│   └── usuarios/                        # Gestión de usuarios
├── admin-routing.module.ts              # Rutas del módulo de administración
└── admin.module.ts                      # Módulo principal de administración
```

## Catálogos Implementados

### 1. **Estaciones de Peaje**
- **Ruta**: `/admin/estaciones`
- **Funcionalidades**:
  - Listado completo de estaciones
  - Búsqueda y filtrado
  - Creación, edición y eliminación
  - Vista de carriles por estación
  - Activación/desactivación

### 2. **Carriles**
- **Ruta**: `/admin/carriles`
- **Funcionalidades**:
  - Gestión de carriles por estación
  - Control de estados (activo, inactivo, mantenimiento)
  - Configuración de tipos de carril

### 3. **Tipos de Vehículo**
- **Ruta**: `/admin/tipos-vehiculo`
- **Funcionalidades**:
  - Categorización de vehículos
  - Configuración de número de ejes
  - Establecimiento de tarifas base
  - Gestión de categorías

### 4. **Tipos de Pago**
- **Ruta**: `/admin/tipos-pago`
- **Funcionalidades**:
  - Configuración de métodos de pago
  - Definición de límites de crédito
  - Configuración de autorizaciones requeridas
  - Gestión de características (efectivo, tarjeta, tag)

### 5. **Tipos de Cliente**
- **Ruta**: `/admin/tipos-cliente`
- **Funcionalidades**:
  - Categorización de clientes
  - Configuración de descuentos
  - Gestión de beneficios por tipo

### 6. **Tarifas**
- **Ruta**: `/admin/tarifas`
- **Funcionalidades**:
  - Configuración de tarifas por tipo de vehículo
  - Tarifas específicas por estación
  - Gestión de vigencias
  - Histórico de tarifas

### 7. **Clientes**
- **Ruta**: `/admin/clientes`
- **Funcionalidades**:
  - Registro y gestión de clientes
  - Información personal y de contacto
  - Asociación con tipos de cliente
  - Gestión de tarjetas RFID

### 8. **Empleados**
- **Ruta**: `/admin/empleados`
- **Funcionalidades**:
  - Registro de empleados
  - Asignación a estaciones
  - Gestión de cargos
  - Control de estados activos/inactivos

### 9. **Tarjetas RFID**
- **Ruta**: `/admin/tarjetas-rfid`
- **Funcionalidades**:
  - Emisión y gestión de tarjetas
  - Recarga de saldo
  - Control de estados y vencimientos
  - Asociación con clientes

### 10. **Usuarios del Sistema**
- **Ruta**: `/admin/usuarios`
- **Funcionalidades**:
  - Gestión de usuarios del sistema
  - Configuración de roles y permisos
  - Cambio de contraseñas
  - Asociación con empleados

## Componentes Compartidos

### DataTableComponent
Componente reutilizable para mostrar datos tabulares con las siguientes características:
- **Búsqueda**: Filtrado en tiempo real
- **Ordenamiento**: Por columnas configurables
- **Paginación**: Navegación entre páginas
- **Acciones**: Botones de acción personalizables
- **Tipos de datos**: Soporte para texto, números, fechas, booleanos, moneda
- **Responsivo**: Adaptable a diferentes tamaños de pantalla

### ConfirmDialogComponent
Diálogo de confirmación reutilizable para acciones destructivas:
- **Personalizable**: Título, mensaje y textos de botones
- **Seguro**: Previene acciones accidentales
- **Accesible**: Manejo de teclado y enfoque

### LoadingSpinnerComponent
Indicador de carga con opciones:
- **Overlay**: Modo pantalla completa
- **Inline**: Integrado en contenido
- **Mensajes**: Texto personalizable

## Servicios de Datos

### BaseApiService
Servicio base abstracto que proporciona operaciones CRUD estándar:
- `getAll()`: Obtener todos los registros con paginación
- `getById()`: Obtener registro por ID
- `create()`: Crear nuevo registro
- `update()`: Actualizar registro existente
- `delete()`: Eliminar registro
- `activate()`: Activar registro
- `deactivate()`: Desactivar registro

### Servicios Específicos
Cada catálogo tiene su servicio especializado que extiende `BaseApiService`:
- `EstacionesService`
- `CarrilesService`
- `TiposVehiculoService`
- `TiposPagoService`
- `TiposClienteService`
- `TarifasService`
- `ClientesService`
- `EmpleadosService`
- `TarjetasRfidService`
- `UsuariosService`

## Modelos de Datos

### Interfaces TypeScript
Todas las entidades tienen interfaces TypeScript tipadas:
- `BaseEntity`: Interfaz base con campos comunes
- `Estacion`, `Carril`, `TipoVehiculo`, etc.: Interfaces específicas
- Relaciones entre entidades mediante propiedades navegables

## Configuración

### Ambiente de Desarrollo
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001/api',
  features: {
    enableAdvancedReports: true,
    enableDataExport: true,
    enableRealTimeUpdates: true
  }
};
```

### Ambiente de Producción
```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.sistemapeaje.com/v1',
  features: {
    enableAdvancedReports: true,
    enableDataExport: true,
    enableRealTimeUpdates: true
  }
};
```

## Funcionalidades Implementadas

### ✅ Completadas
- **Estructura de módulos**: Arquitectura modular completa
- **Navegación**: Menú lateral con categorías organizadas
- **Componentes base**: DataTable, ConfirmDialog, LoadingSpinner
- **Servicios de datos**: BaseApiService y servicios específicos
- **Modelos TypeScript**: Interfaces tipadas para todas las entidades
- **Estaciones**: Implementación completa con ejemplo funcional
- **Routing**: Configuración de rutas para todos los catálogos

### 🔄 En Desarrollo
- **Formularios**: Componentes de creación y edición
- **Validaciones**: Validación de datos con Angular Forms
- **Exports**: Exportación de datos a Excel/PDF
- **Filtros avanzados**: Filtros específicos por catálogo

### 📋 Próximos Pasos
1. Implementar formularios para cada catálogo
2. Agregar validaciones de negocio
3. Implementar búsqueda avanzada
4. Agregar exportación de datos
5. Implementar notificaciones toast
6. Agregar drag & drop para tablas
7. Implementar bulk operations
8. Agregar campos personalizados

## Uso

### Navegación
El sistema se accede através de la ruta `/admin` que redirige automáticamente a `/admin/estaciones`.

### Desarrollo
Para agregar un nuevo catálogo:
1. Crear el modelo en `libs/data-access/src/lib/models/catalog.models.ts`
2. Agregar el servicio en `libs/data-access/src/lib/services/catalog.services.ts`
3. Crear el componente de página en `pages/`
4. Agregar la ruta en `admin-routing.module.ts`
5. Agregar el enlace en `admin-layout.component.ts`

### Tecnologías Utilizadas
- **Angular 18+**: Framework principal
- **TypeScript**: Lenguaje de programación
- **RxJS**: Programación reactiva
- **CSS Grid/Flexbox**: Layout responsivo
- **Font Awesome**: Iconografía
- **HTTP Client**: Comunicación con API

## Integración con API

El sistema está diseñado para integrarse con la API de SistemaPeaje.API:
- **Base URL**: Configurable por ambiente
- **Autenticación**: JWT tokens
- **Paginación**: Soporte para paginación server-side
- **Filtros**: Parámetros de consulta para búsqueda
- **Ordenamiento**: Soporte para ordenamiento server-side

## Mantenimiento

### Estructura de Archivos
- Un archivo por componente/servicio
- Nombres descriptivos y consistentes
- Organización por funcionalidad

### Convenciones
- Nombres en español para UI
- Nombres en inglés para código
- Interfaces TypeScript para todos los modelos
- Servicios inyectables con providedIn: 'root'

Este sistema proporciona una base sólida para la gestión de catálogos del sistema de peaje, con una arquitectura escalable y mantenible.
