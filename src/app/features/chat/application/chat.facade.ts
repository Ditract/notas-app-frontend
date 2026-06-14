import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ChatRepository } from '../domain/chat.repository';
import { ChatMessage } from '../domain/chat-message.model';
import { ContextualChatRequest } from '../domain/chat-api.model';
import {
  ChatPosition,
  ChatSide,
  ChatViewState,
} from '../domain/chat-preferences.model';
import { ChatPreferencesStorage } from '../infrastructure/chat-preferences.storage';

@Injectable({ providedIn: 'root' })
export class ChatFacade {
  private readonly chatRepository = inject(ChatRepository);
  private readonly preferencesStorage = inject(ChatPreferencesStorage);

  private readonly messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  readonly messages$ = this.messagesSubject.asObservable();

  private readonly viewStateSubject = new BehaviorSubject<ChatViewState>('collapsed');
  readonly viewState$ = this.viewStateSubject.asObservable();
  /** @deprecated Use viewState$ instead */
  readonly isOpen$ = this.viewState$;

  private readonly positionSubject = new BehaviorSubject<ChatPosition>({
    side: 'right',
    offsetY: 24,
  });
  readonly position$ = this.positionSubject.asObservable();

  private readonly isLoadingSubject = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this.isLoadingSubject.asObservable();

  private sessionId: string = crypto.randomUUID();
  private subscription?: Subscription;
  private welcomeSubscription?: Subscription;

  constructor() {
    const prefs = this.preferencesStorage.load();
    this.viewStateSubject.next(prefs.viewState);
    this.positionSubject.next({ side: prefs.side, offsetY: prefs.offsetY });
    if (prefs.viewState === 'expanded') {
      this.loadWelcome();
    }
  }

  toggle(): void {
    if (this.viewStateSubject.value === 'expanded') {
      this.collapse();
    } else {
      this.expand();
    }
  }

  expand(): void {
    const opening = this.viewStateSubject.value !== 'expanded';
    this.viewStateSubject.next('expanded');

    const current = this.positionSubject.value;
    const clampedY = this.preferencesStorage.clampOffsetY(current.offsetY, true);
    if (clampedY !== current.offsetY) {
      this.positionSubject.next({ side: current.side, offsetY: clampedY });
    }

    this.persistPreferences();
    if (opening && this.messagesSubject.value.length === 0) {
      this.loadWelcome();
    }
  }

  collapse(): void {
    this.viewStateSubject.next('collapsed');
    this.persistPreferences();
  }

  close(): void {
    this.collapse();
  }

  isOpen(): boolean {
    return this.viewStateSubject.value === 'expanded';
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getPosition(): ChatPosition {
    return this.positionSubject.value;
  }

  setPosition(side: ChatSide, offsetY: number): void {
    const clamped = this.preferencesStorage.clampOffsetY(
      offsetY,
      this.viewStateSubject.value === 'expanded',
    );
    this.positionSubject.next({ side, offsetY: clamped });
    this.persistPreferences();
  }

  reclampPosition(): void {
    const current = this.positionSubject.value;
    this.setPosition(current.side, current.offsetY);
  }

  loadWelcome(): void {
    this.welcomeSubscription?.unsubscribe();
    this.isLoadingSubject.next(true);

    this.welcomeSubscription = this.chatRepository.fetchWelcome(this.sessionId).subscribe({
      next: ({ respuesta, sessionId }) => {
        this.sessionId = sessionId;
        const welcomeMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: respuesta,
          timestamp: new Date(),
        };
        this.messagesSubject.next([welcomeMessage]);
        this.isLoadingSubject.next(false);
      },
      error: () => {
        this.isLoadingSubject.next(false);
        if (this.messagesSubject.value.length === 0) {
          const fallback: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: 'No pude cargar tu resumen de notas. Pregúntame lo que necesites.',
            timestamp: new Date(),
          };
          this.messagesSubject.next([fallback]);
        }
      },
    });
  }

  notifyContextual(request: Omit<ContextualChatRequest, 'sessionId'>): void {
    if (!this.isOpen()) {
      return;
    }

    this.chatRepository
      .notifyContextual({ ...request, sessionId: this.sessionId })
      .subscribe({
        next: ({ respuesta, sessionId }) => {
          this.sessionId = sessionId;
          const contextualMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: respuesta,
            timestamp: new Date(),
          };
          this.messagesSubject.next([...this.messagesSubject.value, contextualMessage]);
        },
        error: () => {},
      });
  }

  sendMessage(text: string): void {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: '',
      timestamp: new Date(),
      streaming: true,
    };

    this.messagesSubject.next([...this.messagesSubject.value, userMessage, assistantMessage]);
    this.isLoadingSubject.next(true);

    this.subscription?.unsubscribe();
    this.subscription = this.chatRepository.sendMessage(text, this.sessionId).subscribe({
      next: (chunk) => {
        const messages = [...this.messagesSubject.value];
        const last = messages[messages.length - 1];
        messages[messages.length - 1] = { ...last, text: last.text + chunk };
        this.messagesSubject.next(messages);
      },
      error: () => {
        this.isLoadingSubject.next(false);
        const messages = [...this.messagesSubject.value];
        const last = messages[messages.length - 1];
        messages[messages.length - 1] = {
          ...last,
          text: 'Error al conectar con el asistente. Intenta de nuevo.',
          streaming: false,
        };
        this.messagesSubject.next(messages);
      },
      complete: () => {
        this.isLoadingSubject.next(false);
        const messages = [...this.messagesSubject.value];
        const last = messages[messages.length - 1];
        messages[messages.length - 1] = { ...last, streaming: false };
        this.messagesSubject.next(messages);
      },
    });
  }

  clearConversation(): void {
    this.subscription?.unsubscribe();
    this.welcomeSubscription?.unsubscribe();
    this.sessionId = crypto.randomUUID();
    this.messagesSubject.next([]);
    this.isLoadingSubject.next(false);
    this.loadWelcome();
  }

  private persistPreferences(): void {
    const position = this.positionSubject.value;
    this.preferencesStorage.save({
      viewState: this.viewStateSubject.value,
      side: position.side,
      offsetY: position.offsetY,
    });
  }
}
