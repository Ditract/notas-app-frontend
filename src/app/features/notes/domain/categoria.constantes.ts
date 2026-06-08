export const CATEGORIAS = ['TRABAJO', 'PERSONAL', 'IDEAS', 'REUNIONES', 'TAREAS'] as const;
export type Categoria = typeof CATEGORIAS[number];
