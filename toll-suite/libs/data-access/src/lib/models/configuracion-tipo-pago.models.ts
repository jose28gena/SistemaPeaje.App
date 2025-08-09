import { BaseEntity } from './catalog.models';

// ===================================
// MODELOS PARA CONFIGURACIÓN DE TIPOS DE PAGO
// ===================================

/**
 * Configuración específica para cada tipo de pago
 */
export interface ConfiguracionTipoPago extends BaseEntity {
  tipoPagoId: number;
  tipoPagoNombre?: string;
  moneda: string;
  simboloMoneda: string;
  limiteDiario?: number;
  limiteTransaccion?: number;
  comisionPorcentaje: number;
  comisionFija: number;
  estaActivo: boolean;
  requiereValidacionAdicional: boolean;
  tiempoEsperaSegundos: number;
  descuentoPorDefecto: number;
  permiteTransaccionesParcialeS: boolean;
  configuracionEspecifica?: string;
  observaciones?: string;
}

/**
 * DTO para crear configuración de tipo de pago
 */
export interface CreateConfiguracionTipoPagoDto {
  tipoPagoId: number;
  moneda: string;
  simboloMoneda: string;
  limiteDiario?: number;
  limiteTransaccion?: number;
  comisionPorcentaje: number;
  comisionFija: number;
  estaActivo: boolean;
  requiereValidacionAdicional: boolean;
  tiempoEsperaSegundos: number;
  descuentoPorDefecto: number;
  permiteTransaccionesParcialeS: boolean;
  configuracionEspecifica?: string;
  observaciones?: string;
}

/**
 * DTO para actualizar configuración de tipo de pago
 */
export interface UpdateConfiguracionTipoPagoDto extends CreateConfiguracionTipoPagoDto {
  id: number;
}

/**
 * Tipo de pago con su configuración asociada
 */
export interface TipoPagoConConfiguracion {
  id: number;
  nombre: string;
  descripcion: string;
  requiereEfectivo: boolean;
  requiereTarjeta: boolean;
  requiereTag: boolean;
  requiereAutorizacion: boolean;
  limiteCredito?: number;
  esActivo: boolean;
  configuracion?: ConfiguracionTipoPago;
}

/**
 * Request para cálculo de montos
 */
export interface CalcularMontoRequest {
  tipoPagoId: number;
  montoBase: number;
}

/**
 * Response del cálculo de montos
 */
export interface CalcularMontoResponse {
  tipoPagoId: number;
  tipoPagoNombre: string;
  montoBase: number;
  descuentoAplicado: number;
  comisionPorcentual: number;
  comisionFija: number;
  montoFinal: number;
  moneda: string;
  simboloMoneda: string;
  excedeLimiteTransaccion: boolean;
  detalleCalculo?: string;
}

/**
 * Estadísticas de tipos de pago
 */
export interface EstadisticasTipoPago {
  totalTipos: number;
  tiposActivos: number;
  tiposInactivos: number;
  tipoMasUsado?: string;
  transaccionesTotales: number;
  montoTotalProcesado: number;
  comisionesTotales: number;
  descuentosTotales: number;
}

/**
 * Parámetros de filtro para configuraciones
 */
export interface FiltroConfiguracionTipoPago {
  soloActivos?: boolean;
  conConfiguracion?: boolean;
  tipoPagoId?: number;
  moneda?: string;
}

/**
 * Response para procesamiento de pagos
 */
export interface ProcesarPagoResponse {
  exito: boolean;
  mensaje: string;
  transaccionId?: string;
  montoFinal: number;
  comisionAplicada: number;
  descuentoAplicado: number;
  tiempoEspera: number;
  requiereValidacionAdicional: boolean;
}

/**
 * Request para procesamiento de pagos
 */
export interface ProcesarPagoRequest {
  tipoPagoId: number;
  tipoPago: string;
  monto: number;
  saldoDisponible?: number;
  clienteId?: string;
  parametrosEspecificos?: { [key: string]: any };
}

/**
 * Configuración por defecto para inicialización
 */
export interface ConfiguracionDefecto {
  nombre: string;
  configuracion: Omit<CreateConfiguracionTipoPagoDto, 'tipoPagoId'>;
}

/**
 * Vista resumida de configuración para listas
 */
export interface ConfiguracionTipoPagoResumen {
  id: number;
  tipoPagoId: number;
  tipoPagoNombre: string;
  moneda: string;
  simboloMoneda: string;
  limiteDiario?: number;
  limiteTransaccion?: number;
  comisionPorcentaje: number;
  descuentoPorDefecto: number;
  estaActivo: boolean;
  observaciones?: string;
}

// ===================================
// CONSTANTES Y ENUMS
// ===================================

/**
 * Monedas soportadas
 */
export enum MonedasSoportadas {
  MXN = 'MXN',
  USD = 'USD',
  EUR = 'EUR'
}

/**
 * Símbolos de moneda
 */
export const SIMBOLOS_MONEDA = {
  MXN: '$',
  USD: '$',
  EUR: '€'
} as const;

/**
 * Límites por defecto
 */
export const LIMITES_DEFECTO = {
  EFECTIVO: {
    limiteDiario: 50000,
    limiteTransaccion: 5000
  },
  PREPAGO: {
    limiteDiario: 100000,
    limiteTransaccion: 10000
  },
  RESIDENTES: {
    limiteDiario: 200000,
    limiteTransaccion: 15000
  },
  TARJETA: {
    limiteDiario: 150000,
    limiteTransaccion: 20000
  }
} as const;

/**
 * Configuraciones por defecto
 */
export const CONFIGURACIONES_DEFECTO: ConfiguracionDefecto[] = [
  {
    nombre: 'Efectivo',
    configuracion: {
      moneda: 'MXN',
      simboloMoneda: '$',
      limiteDiario: 50000,
      limiteTransaccion: 5000,
      comisionPorcentaje: 0,
      comisionFija: 0,
      estaActivo: true,
      requiereValidacionAdicional: false,
      tiempoEsperaSegundos: 15,
      descuentoPorDefecto: 0,
      permiteTransaccionesParcialeS: false,
      configuracionEspecifica: '{"requiereConteo": true, "validarBilletes": true}',
      observaciones: 'Configuración estándar para pagos en efectivo'
    }
  },
  {
    nombre: 'Prepago',
    configuracion: {
      moneda: 'MXN',
      simboloMoneda: '$',
      limiteDiario: 100000,
      limiteTransaccion: 10000,
      comisionPorcentaje: 1.5,
      comisionFija: 0,
      estaActivo: true,
      requiereValidacionAdicional: true,
      tiempoEsperaSegundos: 30,
      descuentoPorDefecto: 5,
      permiteTransaccionesParcialeS: true,
      configuracionEspecifica: '{"requierePin": true, "validarSaldo": true}',
      observaciones: 'Configuración para tarjetas prepagadas con descuento del 5%'
    }
  },
  {
    nombre: 'Residentes',
    configuracion: {
      moneda: 'MXN',
      simboloMoneda: '$',
      limiteDiario: 200000,
      limiteTransaccion: 15000,
      comisionPorcentaje: 0,
      comisionFija: 0,
      estaActivo: true,
      requiereValidacionAdicional: true,
      tiempoEsperaSegundos: 45,
      descuentoPorDefecto: 20,
      permiteTransaccionesParcialeS: false,
      configuracionEspecifica: '{"requiereIdentificacion": true, "validarResidencia": true}',
      observaciones: 'Configuración especial para residentes con 20% de descuento'
    }
  }
];
