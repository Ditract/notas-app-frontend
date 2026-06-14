import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface AppConfig {
  apiBaseUrl: string;
  chatApiBaseUrl: string;
  validation: {
    emailPattern: RegExp;
    passwordMinLength: number;
    passwordMaxLength: number;
    passwordPattern: RegExp;
    nombreMinLength: number;
    nombreMaxLength: number;
    tituloMaxLength: number;
    contenidoMaxLength: number;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    apiBaseUrl: environment.apiBaseUrl,
    chatApiBaseUrl: environment.chatApiBaseUrl,
    validation: {
      emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      passwordMinLength: 8,
      passwordMaxLength: 64,
      passwordPattern:
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!?.*_-]).*$/,
      nombreMinLength: 3,
      nombreMaxLength: 40,
      tituloMaxLength: 255,
      contenidoMaxLength: 10000,
    },
  }),
});