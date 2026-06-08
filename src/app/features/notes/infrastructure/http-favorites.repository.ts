import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FavoritesRepository } from '../domain/favorites.repository';
import { APP_CONFIG, AppConfig } from '../../../core/config/app-config.token';
import { Nota } from '../domain/nota.model';

@Injectable({ providedIn: 'root' })
export class HttpFavoritesRepository extends FavoritesRepository {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  private get baseUrl(): string {
    return this.config.apiBaseUrl;
  }

  override listFavoriteIds(): Observable<number[]> {
    return this.http.get<Nota[]>(`${this.baseUrl}/notas/favoritas`).pipe(
      map((notas) => notas.map((n) => n.id)),
    );
  }

  override addFavorite(noteId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/perfiles/favoritas/${noteId}`, null);
  }

  override removeFavorite(noteId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/perfiles/favoritas/${noteId}`);
  }
}