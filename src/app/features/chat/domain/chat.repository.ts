import { Observable } from 'rxjs';
import { ChatApiResponse, ContextualChatRequest } from './chat-api.model';

export abstract class ChatRepository {
  abstract sendMessage(mensaje: string, sessionId: string): Observable<string>;
  abstract fetchWelcome(sessionId: string): Observable<ChatApiResponse>;
  abstract notifyContextual(request: ContextualChatRequest): Observable<ChatApiResponse>;
}
