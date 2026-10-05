# Sistema de Peaje · Frontend

Frontend del **Sistema de Peaje**: un monorepo Angular 17 con dos aplicaciones PWA y librerías compartidas, que consume una API REST en .NET 8.

> Parte de un sistema completo de tres repositorios:
> [SistemaPeaje.Backend](https://github.com/jose28gena/SistemaPeaje.Backend) (API, Clean Architecture + CQRS) ·
> **SistemaPeaje.App** (este repo) ·
> [SistemaPeaje.DB](https://github.com/jose28gena/SistemaPeaje.DB) (SQL Server)

## Aplicaciones

| App | Descripción |
| --- | --- |
| `operator-panel` | Panel del operador: control de carriles, cobro, semáforos de carril e incidentes, control de barrera |
| `reports-dashboard` | Panel de administración: reportes, analítica, tarifas, empleados y turnos |

## Librerías compartidas

- `libs/ui-kit`: componentes UI reutilizables (tarjetas de métricas, estado de carril)
- `libs/data-access`: servicios y modelos para consumir la API

## Stack

Angular 17 · TypeScript · Angular Material / CDK · RxJS · SCSS · PWA (Service Worker) · Karma + Jasmine

## Ejecutar en local

```bash
cd toll-suite
npm install

npm run start:operator    # panel de operador
npm run start:dashboard   # dashboard de reportes
```

Build de producción:

```bash
npm run build:prod
```

La URL de la API se configura en los archivos `environments/` de cada aplicación.

## Documentación

Arquitectura y módulos en [`toll-suite/README.md`](toll-suite/README.md) y [`toll-suite/docs/`](toll-suite/docs/).
