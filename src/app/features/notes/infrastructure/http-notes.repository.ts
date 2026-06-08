import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Nota, CreateNotaData, UpdateNotaData } from '../domain/nota.model';
import { NotesRepository } from '../domain/notes.repository';
import { EstadisticasResponse } from '../domain/estadisticas.model';
import { APP_CONFIG, AppConfig } from '../../../core/config/app-config.token';

@Injectable({ providedIn: 'root' })
export class HttpNotesRepository extends NotesRepository {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  private get baseUrl(): string {
    return this.config.apiBaseUrl;
  }

  override list(): Observable<Nota[]> {
    return this.http.get<Nota[]>(`${this.baseUrl}/notas`);
  }

  override create(data: CreateNotaData): Observable<Nota> {
    return this.http.post<Nota>(`${this.baseUrl}/notas`, data);
  }

  override update(id: number, data: UpdateNotaData): Observable<Nota> {
    return this.http.patch<Nota>(`${this.baseUrl}/notas/${id}`, data);
  }

  override remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/notas/${id}`);
  }

  override buscar(keyword: string): Observable<Nota[]> {
    return this.http.get<Nota[]>(`${this.baseUrl}/notas/buscar`, { params: { q: keyword } });
  }

  override recientes(limit: number): Observable<Nota[]> {
    return this.http.get<Nota[]>(`${this.baseUrl}/notas/recientes`, { params: { limit: limit.toString() } });
  }

  override porCategoria(categoria: string): Observable<Nota[]> {
    return this.http.get<Nota[]>(`${this.baseUrl}/notas/categoria/${categoria}`);
  }

  override estadisticas(): Observable<EstadisticasResponse> {
    return this.http.get<EstadisticasResponse>(`${this.baseUrl}/notas/estadisticas`);
  }

  override favoritas(): Observable<Nota[]> {
    return this.http.get<Nota[]>(`${this.baseUrl}/notas/favoritas`);
  }
}