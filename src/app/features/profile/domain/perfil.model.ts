export interface Perfil {
  nombre: string;
  notasFavoritas: number[];
}

export interface ChangePasswordData {
  passwordActual: string;
  nuevaPassword: string;
}