import { Injectable, NgZone, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRepository } from '../domain/chat.repository';
import { ChatApiResponse, ContextualChatRequest } from '../domain/chat-api.model';
import { APP_CONFIG } from '../../../core/config/app-config.token';
import { TokenStorage } from '../../../core/auth/infrastructure/token.storage';
import { flushSseBuffer, parseSseBuffer } from './sse-parser';

@Injectable({ providedIn: 'root' })
export class HttpChatRepository extends ChatRepository {
  private readonly config = inject(APP_CONFIG);
  private readonly tokenStorage = inject(TokenStorage);
  private readonly ngZone = inject(NgZone);

  override fetchWelcome(sessionId: string): Observable<ChatApiResponse> {
    return new Observable((observer) => {
      const token = this.tokenStorage.getToken();
      const params = new URLSearchParams({ sessionId });

      fetch(`${this.config.chatApiBaseUrl}/chat/bienvenida?${params}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Welcome request failed with status ${response.status}`);
          }
          const data = (await response.json()) as ChatApiResponse;
          this.ngZone.run(() => {
            observer.next(data);
            observer.complete();
          });
        })
        .catch((err) => this.ngZone.run(() => observer.error(err)));
    });
  }

  override notifyContextual(request: ContextualChatRequest): Observable<ChatApiResponse> {
    return new Observable((observer) => {
      const token = this.tokenStorage.getToken();

      fetch(`${this.config.chatApiBaseUrl}/chat/contextual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Contextual request failed with status ${response.status}`);
          }
          const data = (await response.json()) as ChatApiResponse;
          this.ngZone.run(() => {
            observer.next(data);
            observer.complete();
          });
        })
        .catch((err) => this.ngZone.run(() => observer.error(err)));
    });
  }

  override sendMessage(mensaje: string, sessionId: string): Observable<string> {
    return new Observable((observer) => {
      const token = this.tokenStorage.getToken();
      let buffer = '';

      const emit = (value: string) => {
        this.ngZone.run(() => observer.next(value));
      };

      const complete = () => {
        this.ngZone.run(() => observer.complete());
      };

      const error = (err: unknown) => {
        this.ngZone.run(() => observer.error(err));
      };

      fetch(`${this.config.chatApiBaseUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mensaje, sessionId }),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Chat stream failed with status ${response.status}`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            complete();
            return;
          }

          while (true) {
            const { done, value } = await reader.read();

            if (value) {
              buffer += decoder.decode(value, { stream: true });
              const parsed = parseSseBuffer(buffer);
              buffer = parsed.remaining;

              for (const event of parsed.events) {
                emit(event);
              }
            }

            if (done) {
              buffer += decoder.decode();
              for (const event of flushSseBuffer(buffer)) {
                emit(event);
              }
              complete();
              break;
            }
          }
        })
        .catch((err) => error(err));
    });
  }
}
