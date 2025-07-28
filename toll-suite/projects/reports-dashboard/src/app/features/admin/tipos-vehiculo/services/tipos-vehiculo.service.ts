import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TipoVehiculo } from '@data-access';
import { environment } from '../../../../../environments/environment';
import { 
  CreateTipoVehiculoRequest, 
  UpdateTipoVehiculoRequest,
  CatalogoTipoVehiculoDto,
  TipoVehiculoDto,
  TipoVehiculoStats,
  TipoVehiculoCategoria,
  CATEGORIAS_VEHICULO
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
   * Obtiene un tipo de vehículo por ID
   */
  getTipoVehiculoById(id: number): Observable<TipoVehiculoDto | undefined> {
    return this.getTiposVehiculo().pipe(
      map(tipos => tipos.find(t => t.id === id))
    );
  }

  /**
   * Obtiene estadísticas de los tipos de vehículo
   */
  getEstadisticas(): Observable<TipoVehiculoStats> {
    return this.getTiposVehiculo().pipe(
      map(tipos => {
        const stats: TipoVehiculoStats = {
          totalTipos: tipos.length,
          tiposActivos: tipos.filter(t => t.esActivo).length,
          tiposInactivos: tipos.filter(t => !t.esActivo).length,
          porCategoria: {
            LIVIANO: 0,
            PESADO: 0,
            ESPECIAL: 0
          },
          tarifaPromedio: 0
        };

        // Calcular estadísticas por categoría
        tipos.forEach(tipo => {
          const categoria = tipo.categoria as TipoVehiculoCategoria;
          if (stats.porCategoria[categoria] !== undefined) {
            stats.porCategoria[categoria]++;
          }
        });

        // Calcular tarifa promedio
        if (tipos.length > 0) {
          const totalTarifas = tipos.reduce((sum, tipo) => sum + tipo.tarifaBase, 0);
          stats.tarifaPromedio = totalTarifas / tipos.length;
        }

        return stats;
      })
    );
  }

  /**
   * Busca tipos de vehículo por nombre o descripción
   */
  buscarTipos(termino: string): Observable<TipoVehiculoDto[]> {
    return this.getTiposVehiculo().pipe(
      map(tipos => tipos.filter(tipo => 
        tipo.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        tipo.descripcion.toLowerCase().includes(termino.toLowerCase())
      ))
    );
  }

  /**
   * Filtra tipos por categoría
   */
  getTiposPorCategoria(categoria: TipoVehiculoCategoria): Observable<TipoVehiculoDto[]> {
    return this.getTiposVehiculo().pipe(
      map(tipos => tipos.filter(tipo => tipo.categoria === categoria))
    );
  }
}
