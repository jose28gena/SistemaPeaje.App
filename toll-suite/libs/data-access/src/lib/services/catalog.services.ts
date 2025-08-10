import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService, API_BASE_URL } from './base-api.service';
import { 
  Estacion, 
  Carril, 
  TipoVehiculo, 
  TipoPago, 
  TipoCliente, 
  Tarifa, 
  Cliente, 
  Empleado, 
  TarjetaRfid, 
  Usuario 
} from '../models/catalog.models';

@Injectable({
  providedIn: 'root'
})
export class EstacionesService extends BaseApiService<Estacion> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'Estaciones', baseUrl);
  }

  getCarrilesByEstacion(estacionId: number): Observable<Carril[]> {
    return this.http.get<Carril[]>(`${this.baseUrl}/${this.endpoint}/${estacionId}/carriles`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class CarrilesService extends BaseApiService<Carril> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'Carriles', baseUrl);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TiposVehiculoService extends BaseApiService<TipoVehiculo> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'TiposVehiculo', baseUrl);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TiposPagoService extends BaseApiService<TipoPago> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'TiposPago', baseUrl);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TiposClienteService extends BaseApiService<TipoCliente> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'TiposCliente', baseUrl);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TarifasService extends BaseApiService<Tarifa> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'Tarifas', baseUrl);
  }

  getByTipoVehiculo(tipoVehiculoId: number): Observable<Tarifa[]> {
    return this.http.get<Tarifa[]>(`${this.baseUrl}/${this.endpoint}/by-tipo-vehiculo/${tipoVehiculoId}`);
  }

  getByEstacion(estacionId: number): Observable<Tarifa[]> {
    return this.http.get<Tarifa[]>(`${this.baseUrl}/${this.endpoint}/by-estacion/${estacionId}`);
  }

  getVigentes(estacionId?: number, tipoVehiculoId?: number): Observable<Tarifa[]> {
    let params = new HttpParams();
    if (estacionId) params = params.set('estacionId', estacionId.toString());
    if (tipoVehiculoId) params = params.set('tipoVehiculoId', tipoVehiculoId.toString());
    
    return this.http.get<Tarifa[]>(`${this.baseUrl}/${this.endpoint}/vigentes`, { params });
  }

  getTarifaVigente(tipoVehiculoId: number, estacionId?: number): Observable<Tarifa> {
    let params = new HttpParams().set('tipoVehiculoId', tipoVehiculoId.toString());
    if (estacionId) params = params.set('estacionId', estacionId.toString());
    
    return this.http.get<Tarifa>(`${this.baseUrl}/${this.endpoint}/vigente`, { params });
  }

  calcularTarifa(request: CalculoTarifaRequest): Observable<CalculoTarifaResponse> {
    return this.http.post<CalculoTarifaResponse>(`${this.baseUrl}/${this.endpoint}/calcular`, request);
  }
}

// DTOs para el cálculo de tarifas (agregados desde el controlador)
export interface CalculoTarifaRequest {
  tipoVehiculoId: number;
  estacionId?: number;
  esResidente?: boolean;
  esPrepago?: boolean;
  esHorarioPico?: boolean;
  descuentoFrecuencia?: number;
  aplicaIVA?: boolean;
  aplicaTasaAdministrativa?: boolean;
  otrosRecargos?: number;
}

export interface CalculoTarifaResponse {
  tarifaBaseId: number;
  montoBase: number;
  montoTotal: number;
  tipoVehiculoId: number;
  estacionId?: number;
  fechaCalculo: Date;
  conceptos: ConceptoTarifa[];
}

export interface ConceptoTarifa {
  nombre: string;
  monto: number;
  tipoConcepto: string; // Base, Descuento, Recargo, Impuesto, Tasa
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService extends BaseApiService<Cliente> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'Clientes', baseUrl);
  }

  /**
   * Obtiene todos los clientes (raw array, not paginated)
   */
  getAllRaw(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/${this.endpoint}`);
  }

  /**
   * Crea un nuevo cliente
   */
  createCliente(request: any): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/${this.endpoint}`, request);
  }

  /**
   * Actualiza un cliente existente
   */
  updateCliente(id: number, request: any): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${this.endpoint}/${id}`, request);
  }

  /**
   * Obtiene las tarjetas RFID de un cliente
   */
  getTarjetasCliente(clienteId: number): Observable<TarjetaRfid[]> {
    return this.http.get<TarjetaRfid[]>(`${this.baseUrl}/${this.endpoint}/${clienteId}/tarjetas`);
  }

  getByDocumento(numeroDocumento: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${this.endpoint}/by-documento/${numeroDocumento}`);
  }

  getTarjetas(clienteId: number): Observable<TarjetaRfid[]> {
    return this.http.get<TarjetaRfid[]>(`${this.baseUrl}/${this.endpoint}/${clienteId}/tarjetas`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TarjetasRfidService extends BaseApiService<TarjetaRfid> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'TarjetasRfid', baseUrl);
  }

  /**
   * Obtiene todas las tarjetas RFID (raw array, not paginated)
   */
  getAllRaw(): Observable<TarjetaRfid[]> {
    return this.http.get<TarjetaRfid[]>(`${this.baseUrl}/${this.endpoint}`);
  }

  /**
   * Obtiene una tarjeta RFID por número de tag
   */
  getByTag(numeroTag: string): Observable<TarjetaRfid> {
    return this.http.get<TarjetaRfid>(`${this.baseUrl}/${this.endpoint}/tag/${numeroTag}`);
  }

  /**
   * Crea una nueva tarjeta RFID
   */
  createTarjeta(request: any): Observable<TarjetaRfid> {
    return this.http.post<TarjetaRfid>(`${this.baseUrl}/${this.endpoint}`, request);
  }

  /**
   * Recarga una tarjeta RFID
   */
  recargarTarjeta(id: number, request: any): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${this.endpoint}/${id}/recargar`, request);
  }

  /**
   * Bloquea una tarjeta RFID
   */
  bloquearTarjeta(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${this.endpoint}/${id}/bloquear`, {});
  }

  /**
   * Activa una tarjeta RFID
   */
  activarTarjeta(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${this.endpoint}/${id}/activar`, {});
  }

  getByCliente(clienteId: number): Observable<TarjetaRfid[]> {
    return this.http.get<TarjetaRfid[]>(`${this.baseUrl}/${this.endpoint}/by-cliente/${clienteId}`);
  }

  getByNumeroTag(numeroTag: string): Observable<TarjetaRfid> {
    return this.getByTag(numeroTag);
  }
}

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService extends BaseApiService<Empleado> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'Empleados', baseUrl);
  }

  getByCedula(cedula: string): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.baseUrl}/${this.endpoint}/by-cedula/${cedula}`);
  }

  getByEstacion(estacionId: number): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.baseUrl}/${this.endpoint}/by-estacion/${estacionId}`);
  }

  getActivos(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.baseUrl}/${this.endpoint}/activos`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends BaseApiService<Usuario> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'Usuarios', baseUrl);
  }

  getByUsername(username: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${this.endpoint}/by-username/${username}`);
  }

  changePassword(id: number, currentPassword: string, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${this.endpoint}/${id}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  resetPassword(id: number): Observable<string> {
    return this.http.patch<string>(`${this.baseUrl}/${this.endpoint}/${id}/reset-password`, {});
  }
}
