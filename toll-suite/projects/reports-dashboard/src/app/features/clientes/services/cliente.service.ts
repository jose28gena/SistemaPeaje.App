import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  Cliente, 
  CrearClienteDto, 
  AprobarKycDto, 
  RechazarKycDto, 
  ConfigurarComercialDto, 
  AsociarVehiculoDto, 
  SuspenderClienteDto, 
  CerrarClienteDto,
  ClienteVehiculo,
  ClienteDocumento,
  TicketSoporte
} from '../models/cliente.models';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly baseUrl = 'http://localhost:5000/api/clientes-flujo';

  constructor(private http: HttpClient) {}

  // Crear nuevo cliente (Alta)
  crearCliente(cliente: CrearClienteDto): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/alta`, cliente)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener cliente por ID
  obtenerCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Listar todos los clientes con filtros
  listarClientes(
    estado?: string,
    tipoPersona?: string,
    modeloCuenta?: string,
    kycCompletado?: boolean,
    pagina: number = 1,
    tamaño: number = 10
  ): Observable<{ clientes: Cliente[], total: number }> {
    let params: any = {
      pagina: pagina.toString(),
      tamaño: tamaño.toString()
    };

    if (estado) params.estado = estado;
    if (tipoPersona) params.tipoPersona = tipoPersona;
    if (modeloCuenta) params.modeloCuenta = modeloCuenta;
    if (kycCompletado !== undefined) params.kycCompletado = kycCompletado.toString();

    return this.http.get<{ clientes: Cliente[], total: number }>(`${this.baseUrl}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Buscar clientes
  buscarClientes(termino: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/buscar`, {
      params: { q: termino }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Aprobar KYC
  aprobarKyc(id: number, datos: AprobarKycDto): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/${id}/aprobar-kyc`, datos)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Rechazar KYC
  rechazarKyc(id: number, datos: RechazarKycDto): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/${id}/rechazar-kyc`, datos)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Configurar datos comerciales
  configurarComercial(id: number, datos: ConfigurarComercialDto): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/${id}/configurar-comercial`, datos)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Asociar vehículo
  asociarVehiculo(id: number, vehiculo: AsociarVehiculoDto): Observable<ClienteVehiculo> {
    return this.http.post<ClienteVehiculo>(`${this.baseUrl}/${id}/vehiculos`, vehiculo)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Listar vehículos del cliente
  listarVehiculos(id: number): Observable<ClienteVehiculo[]> {
    return this.http.get<ClienteVehiculo[]>(`${this.baseUrl}/${id}/vehiculos`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Suspender cliente
  suspenderCliente(id: number, datos: SuspenderClienteDto): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/${id}/suspender`, datos)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Reactivar cliente
  reactivarCliente(id: number, motivo: string): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/${id}/reactivar`, { 
      motivo,
      reactivadoPor: 'usuario-actual' // TODO: obtener del servicio de autenticación
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Cerrar cliente
  cerrarCliente(id: number, datos: CerrarClienteDto): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/${id}/cerrar`, datos)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener documentos del cliente
  obtenerDocumentos(id: number): Observable<ClienteDocumento[]> {
    return this.http.get<ClienteDocumento[]>(`${this.baseUrl}/${id}/documentos`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Subir documento
  subirDocumento(id: number, documento: FormData): Observable<ClienteDocumento> {
    return this.http.post<ClienteDocumento>(`${this.baseUrl}/${id}/documentos`, documento)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Validar documento
  validarDocumento(clienteId: number, documentoId: number, observaciones?: string): Observable<ClienteDocumento> {
    return this.http.put<ClienteDocumento>(`${this.baseUrl}/${clienteId}/documentos/${documentoId}/validar`, {
      observaciones,
      validadoPor: 'usuario-actual' // TODO: obtener del servicio de autenticación
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Rechazar documento
  rechazarDocumento(clienteId: number, documentoId: number, motivo: string): Observable<ClienteDocumento> {
    return this.http.put<ClienteDocumento>(`${this.baseUrl}/${clienteId}/documentos/${documentoId}/rechazar`, {
      motivo,
      rechazadoPor: 'usuario-actual' // TODO: obtener del servicio de autenticación
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener tickets de soporte
  obtenerTicketsSoporte(id: number): Observable<TicketSoporte[]> {
    return this.http.get<TicketSoporte[]>(`${this.baseUrl}/${id}/tickets-soporte`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Crear ticket de soporte
  crearTicketSoporte(id: number, ticket: any): Observable<TicketSoporte> {
    return this.http.post<TicketSoporte>(`${this.baseUrl}/${id}/tickets-soporte`, ticket)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener estadísticas del cliente
  obtenerEstadisticas(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/estadisticas`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Obtener historial de cambios
  obtenerHistorial(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${id}/historial`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Exportar datos del cliente
  exportarCliente(id: number, formato: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/exportar`, {
      params: { formato },
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener resumen para dashboard
  obtenerResumenDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/resumen`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud inválida. Verifique los datos enviados.';
          break;
        case 401:
          errorMessage = 'No autorizado. Inicie sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'Acceso denegado. No tiene permisos para esta operación.';
          break;
        case 404:
          errorMessage = 'Cliente no encontrado.';
          break;
        case 409:
          errorMessage = 'Conflicto. El cliente ya existe o no puede realizar esta operación.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Contacte al administrador.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
      
      // Si hay detalles adicionales en la respuesta
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('Error en ClienteService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
