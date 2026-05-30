import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Perfil, ChangePasswordData } from '../domain/perfil.model';
import { ProfileRepository } from '../domain/profile.repository';
import { APP_CONFIG, AppConfig } from '../../../core/config/app-config.token';

@Injectable({ providedIn: 'root' })
export class HttpProfileRepository extends ProfileRepository {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  private get baseUrl(): string {
    return this.config.apiBaseUrl;
  }

  override getMyProfile(): Observable<Perfil> {
    return this.http.get<Perfil>(`${this.baseUrl}/perfiles/mi-perfil`);
  }

  override updateName(nombre: string): Observable<Perfil> {
    return this.http.put<Perfil>(`${this.baseUrl}/perfiles/mi-perfil`, { nombre });
  }

  override changePassword(data: ChangePasswordData): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/perfiles/mi-perfil/password`, {
      passwordActual: data.passwordActual,
      nuevaPassword: data.nuevaPassword,
    });
  }
}