export interface Nota {
  id: number;
  titulo: string;
  contenido: string;
  categoria?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNotaData {
  titulo: string;
  contenido: string;
  categoria?: string;
}

export interface UpdateNotaData {
  titulo?: string;
  contenido?: string;
  categoria?: string;
}