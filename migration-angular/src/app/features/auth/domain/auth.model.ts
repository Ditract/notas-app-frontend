export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  token: string;
  nuevaPassword: string;
}

export interface AuthResponse {
  token?: string;
  mensaje?: string;
  message?: string;
}

export interface VerificationError {
  message?: string;
  isTokenInvalid?: boolean;
  isAlreadyVerified?: boolean;
}