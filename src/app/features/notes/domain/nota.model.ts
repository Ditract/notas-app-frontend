export interface Nota {
  id: number;
  titulo: string;
  contenido: string;
}

export interface CreateNotaData {
  titulo: string;
  contenido: string;
}

export interface UpdateNotaData {
  titulo?: string;
  contenido?: string;
}