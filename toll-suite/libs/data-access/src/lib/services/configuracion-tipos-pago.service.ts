import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService, API_BASE_URL } from './base-api.service';
import { 
  ConfiguracionTipoPago,
  CreateConfiguracionTipoPagoDto,
  UpdateConfiguracionTipoPagoDto,
  TipoPagoConConfiguracion,
  CalcularMontoRequest,
  CalcularMontoResponse,
  EstadisticasTipoPago,
  FiltroConfiguracionTipoPago,
  ProcesarPagoRequest,
  ProcesarPagoResponse,
  ConfiguracionTipoPagoResumen
} from '../models/configuracion-tipo-pago.models';

/**
 * Servicio para gestionar configuraciones de tipos de pago
 */
@Injectable({
  providedIn: 'root'
})
export class ConfiguracionTiposPagoService extends BaseApiService<ConfiguracionTipoPago> {
  
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'ConfiguracionTiposPago', baseUrl);
  }

  // ===================================
  // MÉTODOS ESPECÍFICOS DE CONFIGURACIÓN
  // ===================================

  /**
   * Obtiene configuraciones con filtros
   */
  getConfiguracionesConFiltros(filtros?: FiltroConfiguracionTipoPago): Observable<ConfiguracionTipoPago[]> {
    let params = new HttpParams();
    
    if (filtros?.soloActivos) {
      params = params.set('soloActivos', filtros.soloActivos.toString());
    }
    if (filtros?.conConfiguracion) {
      params = params.set('conConfiguracion', filtros.conConfiguracion.toString());
    }
    if (filtros?.tipoPagoId) {
      params = params.set('tipoPagoId', filtros.tipoPagoId.toString());
    }
    if (filtros?.moneda) {
      params = params.set('moneda', filtros.moneda);
    }

    return this.http.get<ConfiguracionTipoPago[]>(`${this.baseUrl}/${this.endpoint}`, { params });
  }

  /**
   * Obtiene tipos de pago activos con su configuración
   */
  getTiposActivosConConfiguracion(): Observable<TipoPagoConConfiguracion[]> {
    return this.http.get<TipoPagoConConfiguracion[]>(`${this.baseUrl}/${this.endpoint}/activos-con-configuracion`);
  }

  /**
   * Obtiene configuración por tipo de pago
   */
  getConfiguracionPorTipoPago(tipoPagoId: number): Observable<ConfiguracionTipoPago> {
    return this.http.get<ConfiguracionTipoPago>(`${this.baseUrl}/${this.endpoint}/tipo-pago/${tipoPagoId}`);
  }

  /**
   * Calcula el monto final con comisiones y descuentos
   */
  calcularMonto(request: CalcularMontoRequest): Observable<CalcularMontoResponse> {
    return this.http.post<CalcularMontoResponse>(`${this.baseUrl}/${this.endpoint}/calcular-monto`, request);
  }

  /**
   * Procesa un pago con el tipo especificado
   */
  procesarPago(request: ProcesarPagoRequest): Observable<ProcesarPagoResponse> {
    return this.http.post<ProcesarPagoResponse>(`${this.baseUrl}/TiposPago/procesar`, request);
  }

  /**
   * Inicializa configuraciones por defecto
   */
  inicializarConfiguracionesDefecto(): Observable<ConfiguracionTipoPago[]> {
    return this.http.post<ConfiguracionTipoPago[]>(`${this.baseUrl}/${this.endpoint}/inicializar-configuraciones-defecto`, {});
  }

  /**
   * Obtiene estadísticas de tipos de pago
   */
  getEstadisticas(): Observable<EstadisticasTipoPago> {
    return this.http.get<EstadisticasTipoPago>(`${this.baseUrl}/TiposPago/estadisticas`);
  }

  /**
   * Activa o desactiva un tipo de pago
   */
  toggleActivacion(id: number, activo: boolean): Observable<ConfiguracionTipoPago> {
    return this.http.patch<ConfiguracionTipoPago>(`${this.baseUrl}/${this.endpoint}/${id}/toggle-activacion`, {
      estaActivo: activo
    });
  }

  /**
   * Obtiene configuración resumida para listas
   */
  getConfiguracionesResumen(): Observable<ConfiguracionTipoPagoResumen[]> {
    return this.http.get<ConfiguracionTipoPagoResumen[]>(`${this.baseUrl}/${this.endpoint}/resumen`);
  }

  /**
   * Valida configuración antes de guardar
   */
  validarConfiguracion(configuracion: CreateConfiguracionTipoPagoDto | UpdateConfiguracionTipoPagoDto): Observable<{valida: boolean; errores: string[]}> {
    return this.http.post<{valida: boolean; errores: string[]}>(`${this.baseUrl}/${this.endpoint}/validar`, configuracion);
  }

  /**
   * Duplica configuración de un tipo a otro
   */
  duplicarConfiguracion(origenId: number, destinoTipoPagoId: number): Observable<ConfiguracionTipoPago> {
    return this.http.post<ConfiguracionTipoPago>(`${this.baseUrl}/${this.endpoint}/duplicar`, {
      origenId,
      destinoTipoPagoId
    });
  }

  /**
   * Obtiene historial de cambios en configuración
   */
  getHistorialCambios(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${this.endpoint}/${id}/historial`);
  }

  /**
   * Exporta configuraciones a JSON
   */
  exportarConfiguraciones(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${this.endpoint}/exportar`, {
      responseType: 'blob'
    });
  }

  /**
   * Importa configuraciones desde JSON
   */
  importarConfiguraciones(archivo: File): Observable<{importadas: number; errores: string[]}> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    
    return this.http.post<{importadas: number; errores: string[]}>(`${this.baseUrl}/${this.endpoint}/importar`, formData);
  }

  // ===================================
  // MÉTODOS HELPER PARA VALIDACIONES
  // ===================================

  /**
   * Valida límites de configuración
   */
  validarLimites(configuracion: CreateConfiguracionTipoPagoDto): string[] {
    const errores: string[] = [];
    
    if (configuracion.limiteDiario && configuracion.limiteTransaccion) {
      if (configuracion.limiteTransaccion > configuracion.limiteDiario) {
        errores.push('El límite por transacción no puede ser mayor al límite diario');
      }
    }
    
    if (configuracion.comisionPorcentaje < 0 || configuracion.comisionPorcentaje > 100) {
      errores.push('La comisión porcentual debe estar entre 0 y 100');
    }
    
    if (configuracion.comisionFija < 0) {
      errores.push('La comisión fija no puede ser negativa');
    }
    
    if (configuracion.descuentoPorDefecto < 0 || configuracion.descuentoPorDefecto > 100) {
      errores.push('El descuento por defecto debe estar entre 0 y 100');
    }
    
    if (configuracion.tiempoEsperaSegundos < 5 || configuracion.tiempoEsperaSegundos > 300) {
      errores.push('El tiempo de espera debe estar entre 5 y 300 segundos');
    }
    
    return errores;
  }

  /**
   * Formatea monto con símbolo de moneda
   */
  formatearMonto(monto: number, simbolo: string = '$'): string {
    return `${simbolo}${monto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Calcula porcentaje de uso de límite
   */
  calcularPorcentajeUsoLimite(montoUsado: number, limite: number): number {
    if (!limite || limite === 0) return 0;
    return Math.min((montoUsado / limite) * 100, 100);
  }

  /**
   * Obtiene color para indicador de límite
   */
  getColorIndicadorLimite(porcentaje: number): string {
    if (porcentaje >= 90) return 'danger';
    if (porcentaje >= 70) return 'warning';
    return 'success';
  }
}

/**
 * Servicio extendido para tipos de pago con funcionalidades adicionales
 */
@Injectable({
  providedIn: 'root'
})
export class TiposPagoServiceExtendido {
  
  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private baseUrl: string
  ) {}

  /**
   * Inicializa tipos de pago básicos
   */
  inicializarTiposBasicos(): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/TiposPago/inicializar-tipos-basicos`, {});
  }

  /**
   * Obtiene tipos de pago activos
   */
  getTiposActivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/TiposPago/activos`);
  }

  /**
   * Obtiene todos los tipos de pago
   */
  getTodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/TiposPago`);
  }
}
