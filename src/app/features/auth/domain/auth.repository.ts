import { Observable } from 'rxjs';
import { SignInCredentials, SignUpCredentials, ResetPasswordData, AuthResponse } from './auth.model';

export abstract class AuthRepository {
  abstract signIn(credentials: SignInCredentials): Observable<AuthResponse>;
  abstract signUp(credentials: SignUpCredentials): Observable<AuthResponse>;
  abstract forgotPassword(email: string): Observable<AuthResponse>;
  abstract resetPassword(data: ResetPasswordData): Observable<AuthResponse>;
  abstract verifyAccount(token: string): Observable<AuthResponse>;
  abstract resendVerification(email: string): Observable<AuthResponse>;
}