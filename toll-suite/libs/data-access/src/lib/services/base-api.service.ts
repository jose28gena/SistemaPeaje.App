import { Injectable, Inject, InjectionToken } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export abstract class BaseApiService<T> {
  protected baseUrl: string;

  constructor(protected http: HttpClient, protected endpoint: string, @Inject(API_BASE_URL) baseUrl: string) {
    this.baseUrl = baseUrl;
    console.log('BaseApiService constructor:', { baseUrl, endpoint });
  }

  getAll(params?: QueryParams): Observable<PaginatedResponse<T>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
      
      if (params.filters) {
        Object.keys(params.filters).forEach(key => {
          if (params.filters![key] !== null && params.filters![key] !== undefined) {
            httpParams = httpParams.set(key, params.filters![key].toString());
          }
        });
      }
    }

    const url = `${this.baseUrl}/${this.endpoint}`;
    console.log('Making API request to:', url);
    return this.http.get<PaginatedResponse<T>>(url, { params: httpParams });
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${this.endpoint}/${id}`);
  }

  create(entity: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${this.endpoint}`, entity);
  }

  update(id: number, entity: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${this.endpoint}/${id}`, entity);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.endpoint}/${id}`);
  }

  activate(id: number): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${this.endpoint}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${this.endpoint}/${id}/deactivate`, {});
  }
}
