import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  SignInCredentials,
  SignUpCredentials,
  ResetPasswordData,
  AuthResponse,
} from '../domain/auth.model';
import { AuthRepository } from '../domain/auth.repository';
import { APP_CONFIG, AppConfig } from '../../../core/config/app-config.token';

@Injectable({ providedIn: 'root' })
export class HttpAuthRepository extends AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  private get baseUrl(): string {
    return this.config.apiBaseUrl;
  }

  override signIn(credentials: SignInCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/signin`, {
      email: credentials.email,
      password: credentials.password,
    });
  }

  override signUp(credentials: SignUpCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/signup`, {
      email: credentials.email,
      password: credentials.password,
    });
  }

  override forgotPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/auth/forgot-password?email=${encodeURIComponent(email)}`,
      null,
    );
  }

  override resetPassword(data: ResetPasswordData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/reset-password`, {
      token: data.token,
      nuevaPassword: data.nuevaPassword,
    });
  }

  override verifyAccount(token: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(
      `${this.baseUrl}/auth/verify?token=${encodeURIComponent(token)}`,
    );
  }

  override resendVerification(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/auth/resend-verification?email=${encodeURIComponent(email)}`,
      null,
    );
  }
}