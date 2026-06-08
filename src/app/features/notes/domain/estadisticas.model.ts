export interface EstadisticasResponse {
  totalNotas: number;
  notasPorCategoria: Record<string, number>;
  totalFavoritas: number;
  notaMasReciente: string | null;
  notaMasAntigua: string | null;
}
