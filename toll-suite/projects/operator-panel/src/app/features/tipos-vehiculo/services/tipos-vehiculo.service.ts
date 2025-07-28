import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoVehiculo } from '@data-access';
import { environment } from '../../../../environments/environment';
import { 
  CreateTipoVehiculoRequest, 
  UpdateTipoVehiculoRequest,
  CatalogoTipoVehiculoDto,
  TipoVehiculoDto
} from '../models/tipos-vehiculo.models';

@Injectable({
  providedIn: 'root'
})
export class TiposVehiculoService {
  private readonly baseUrl = `${environment.apiUrl}/tipos-vehiculo-admin`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los tipos de vehículo
   */
  getTiposVehiculo(): Observable<TipoVehiculoDto[]> {
    return this.http.get<TipoVehiculoDto[]>(this.baseUrl);
  }

  /**
   * Obtiene solo los tipos de vehículo activos
   */
  getTiposVehiculoActivos(): Observable<TipoVehiculoDto[]> {
    return this.http.get<TipoVehiculoDto[]>(`${this.baseUrl}/activos`);
  }

  /**
   * Obtiene el catálogo predefinido de tipos de vehículo
   */
  getCatalogo(): Observable<CatalogoTipoVehiculoDto[]> {
    return this.http.get<CatalogoTipoVehiculoDto[]>(`${this.baseUrl}/catalogo`);
  }

  /**
   * Crea un nuevo tipo de vehículo
   */
  createTipoVehiculo(request: CreateTipoVehiculoRequest): Observable<TipoVehiculoDto> {
    return this.http.post<TipoVehiculoDto>(this.baseUrl, request);
  }

  /**
   * Actualiza un tipo de vehículo existente
   */
  updateTipoVehiculo(id: number, request: UpdateTipoVehiculoRequest): Observable<TipoVehiculoDto> {
    return this.http.put<TipoVehiculoDto>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * Elimina (desactiva) un tipo de vehículo
   */
  deleteTipoVehiculo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene un tipo de vehículo por ID (usando la lista general)
   */
  getTipoVehiculoById(id: number): Observable<TipoVehiculoDto | undefined> {
    return new Observable(observer => {
      this.getTiposVehiculo().subscribe({
        next: (tipos) => {
          const tipo = tipos.find(t => t.id === id);
          observer.next(tipo);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }
}
