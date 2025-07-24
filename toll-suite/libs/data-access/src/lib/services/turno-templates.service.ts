import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService, API_BASE_URL, PaginatedResponse } from './base-api.service';
import { HttpClient } from '@angular/common/http';
import { 
  TurnoTemplate, 
  CreateTurnoTemplateDto, 
  UpdateTurnoTemplateDto,
  TurnoTemplateDto 
} from '../models/turnos.models';

@Injectable({
  providedIn: 'root'
})
export class TurnoTemplatesService extends BaseApiService<TurnoTemplate> {
  
  constructor(
    http: HttpClient,
    @Inject(API_BASE_URL) baseUrl: string
  ) {
    super(http, 'api/TurnoTemplates', baseUrl);
  }

  // Métodos específicos para templates
  createTemplate(template: CreateTurnoTemplateDto): Observable<TurnoTemplateDto> {
    return this.http.post<TurnoTemplateDto>(`${this.baseUrl}/${this.endpoint}`, template);
  }

  updateTemplate(id: number, template: UpdateTurnoTemplateDto): Observable<TurnoTemplateDto> {
    return this.http.put<TurnoTemplateDto>(`${this.baseUrl}/${this.endpoint}/${id}`, template);
  }

  duplicateTemplate(id: number, newName: string): Observable<TurnoTemplateDto> {
    return this.http.post<TurnoTemplateDto>(`${this.baseUrl}/${this.endpoint}/${id}/duplicate`, { newName });
  }

  getApplicableTemplates(dayOfWeek: number): Observable<TurnoTemplateDto[]> {
    return this.http.get<TurnoTemplateDto[]>(`${this.baseUrl}/${this.endpoint}/applicable/${dayOfWeek}`);
  }
}
