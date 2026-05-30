import { Injectable, signal, computed } from '@angular/core';
import { TokenStorage } from '../infrastructure/token.storage';
import { decodeJwt, JwtPayload } from '../infrastructure/jwt.util';

export interface CurrentUser {
  email: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly _isAuthenticated = signal(false);
  private readonly _currentUser = signal<CurrentUser | null>(null);

  readonly isAuthenticated = computed(() => this._isAuthenticated());
  readonly currentUser = computed(() => this._currentUser());

  constructor(private readonly tokenStorage: TokenStorage) {
    this._checkExistingSession();
  }

  setSession(token: string): void {
    this.tokenStorage.setToken(token);
    const payload = decodeJwt(token);
    const user: CurrentUser = {
      email: payload?.sub ?? '',
      roles: payload?.roles ?? [],
    };
    this._currentUser.set(user);
    this._isAuthenticated.set(true);
  }

  logout(): void {
    this.tokenStorage.clearToken();
    this._currentUser.set(null);
    this._isAuthenticated.set(false);
  }

  private _checkExistingSession(): void {
    const token = this.tokenStorage.getToken();
    if (token) {
      const payload = decodeJwt(token);
      if (payload?.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          this.logout();
          return;
        }
      }
      const user: CurrentUser = {
        email: payload?.sub ?? '',
        roles: payload?.roles ?? [],
      };
      this._currentUser.set(user);
      this._isAuthenticated.set(true);
    }
  }
}