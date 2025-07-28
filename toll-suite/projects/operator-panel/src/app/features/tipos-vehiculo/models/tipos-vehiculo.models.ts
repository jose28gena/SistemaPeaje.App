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

export interface TipoVehiculoFormData {
  nombre: string;
  descripcion: string;
  numeroEjes: number;
  tarifaBase: number;
  categoria: TipoVehiculoCategoria;
  esActivo: boolean;
}
