import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    super(http, 'estaciones', baseUrl);
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
    super(http, 'carriles', baseUrl);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TiposVehiculoService extends BaseApiService<TipoVehiculo> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'tipos-vehiculo', baseUrl);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TiposPagoService extends BaseApiService<TipoPago> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'tipos-pago', baseUrl);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TiposClienteService extends BaseApiService<TipoCliente> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'tipos-cliente', baseUrl);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TarifasService extends BaseApiService<Tarifa> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'tarifas', baseUrl);
  }

  getByTipoVehiculo(tipoVehiculoId: number): Observable<Tarifa[]> {
    return this.http.get<Tarifa[]>(`${this.baseUrl}/${this.endpoint}/by-tipo-vehiculo/${tipoVehiculoId}`);
  }

  getByEstacion(estacionId: number): Observable<Tarifa[]> {
    return this.http.get<Tarifa[]>(`${this.baseUrl}/${this.endpoint}/by-estacion/${estacionId}`);
  }

  getVigentes(): Observable<Tarifa[]> {
    return this.http.get<Tarifa[]>(`${this.baseUrl}/${this.endpoint}/vigentes`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService extends BaseApiService<Cliente> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'clientes', baseUrl);
  }

  getByDocumento(numeroDocumento: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${this.endpoint}/by-documento/${numeroDocumento}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService extends BaseApiService<Empleado> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'empleados', baseUrl);
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
export class TarjetasRfidService extends BaseApiService<TarjetaRfid> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'tarjetas-rfid', baseUrl);
  }

  getByCliente(clienteId: number): Observable<TarjetaRfid[]> {
    return this.http.get<TarjetaRfid[]>(`${this.baseUrl}/${this.endpoint}/by-cliente/${clienteId}`);
  }

  getByNumeroTag(numeroTag: string): Observable<TarjetaRfid> {
    return this.http.get<TarjetaRfid>(`${this.baseUrl}/${this.endpoint}/by-tag/${numeroTag}`);
  }

  recargarSaldo(id: number, monto: number): Observable<TarjetaRfid> {
    return this.http.patch<TarjetaRfid>(`${this.baseUrl}/${this.endpoint}/${id}/recargar`, { monto });
  }
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends BaseApiService<Usuario> {
  constructor(http: HttpClient, @Inject(API_BASE_URL) baseUrl: string) {
    super(http, 'usuarios', baseUrl);
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
