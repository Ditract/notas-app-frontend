export interface ChatApiResponse {
  respuesta: string;
  sessionId: string;
}

export interface ContextualChatRequest {
  accion: 'CREAR' | 'EDITAR' | 'BORRAR' | 'FAVORITA';
  notaId?: number;
  tituloNota?: string;
  categoria?: string;
  sessionId?: string;
}
