export const CATEGORIAS = ['TRABAJO', 'PERSONAL', 'IDEAS', 'REUNIONES', 'TAREAS'] as const;
export type Categoria = typeof CATEGORIAS[number];

export const CATEGORIA_COLORS: Record<Categoria, string> = {
  TRABAJO: '#dbeafe',
  PERSONAL: '#fce7f3',
  IDEAS: '#fef3c7',
  REUNIONES: '#d1fae5',
  TAREAS: '#e0e7ff',
};

export function getCategoriaColor(categoria: string): string {
  return CATEGORIA_COLORS[categoria as Categoria] ?? 'var(--bg-secondary)';
}
