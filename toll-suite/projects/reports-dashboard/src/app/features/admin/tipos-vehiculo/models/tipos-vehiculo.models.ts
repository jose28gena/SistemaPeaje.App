import { TipoVehiculo } from '@data-access';

export interface CreateTipoVehiculoRequest {
  nombre: string;
  descripcion: string;
  numeroEjes: number;
  tarifaBase: number;
  categoria: string;
}

export interface UpdateTipoVehiculoRequest extends CreateTipoVehiculoRequest {
  esActivo: boolean;
}

export interface CatalogoTipoVehiculoDto {
  nombre: string;
  descripcion: string;
  numeroEjes: number;
  categoria: string;
}

export interface TipoVehiculoDto extends TipoVehiculo {
  fechaModificacion?: Date;
}

export type TipoVehiculoCategoria = 'LIVIANO' | 'PESADO' | 'ESPECIAL';

export const CATEGORIAS_VEHICULO: Record<TipoVehiculoCategoria, string> = {
  LIVIANO: 'Liviano',
  PESADO: 'Pesado',
  ESPECIAL: 'Especial'
};

export const ICONOS_CATEGORIA: Record<TipoVehiculoCategoria, string> = {
  LIVIANO: '🚗',
  PESADO: '🚛',
  ESPECIAL: '🚚'
};

export const COLORES_CATEGORIA: Record<TipoVehiculoCategoria, string> = {
  LIVIANO: '#28a745',
  PESADO: '#ffc107', 
  ESPECIAL: '#dc3545'
};

export interface TipoVehiculoFormData {
  nombre: string;
  descripcion: string;
  numeroEjes: number;
  tarifaBase: number;
  categoria: TipoVehiculoCategoria;
  esActivo: boolean;
}

export interface TipoVehiculoStats {
  totalTipos: number;
  tiposActivos: number;
  tiposInactivos: number;
  porCategoria: Record<TipoVehiculoCategoria, number>;
  tarifaPromedio: number;
}

// Utility functions
export function getCategoriaDisplay(categoria: TipoVehiculoCategoria | string): string {
  const displays = {
    'LIVIANO': 'Liviano',
    'PESADO': 'Pesado',
    'ESPECIAL': 'Especial'
  };
  return displays[categoria as TipoVehiculoCategoria] || categoria;
}

export function getCategoriaColor(categoria: TipoVehiculoCategoria | string): string {
  const colors = {
    'LIVIANO': '#10b981', // Green
    'PESADO': '#f59e0b',  // Yellow
    'ESPECIAL': '#8b5cf6' // Purple
  };
  return colors[categoria as TipoVehiculoCategoria] || '#6b7280';
}
