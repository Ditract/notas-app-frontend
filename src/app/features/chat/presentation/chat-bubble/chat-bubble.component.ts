import {
  Component,
  inject,
  AfterViewChecked,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatFacade } from '../../application/chat.facade';
import { shouldShowTypingBubble } from '../../application/chat-typing.util';
import { ChatSide } from '../../domain/chat-preferences.model';
import { CHAT_BUBBLE_SIZE, CHAT_PANEL_HEIGHT } from '../../domain/chat-preferences.model';
import { MarkdownPipe } from '../../../../shared/pipes/markdown.pipe';

const DRAG_THRESHOLD_PX = 5;
const MOBILE_BREAKPOINT = 420;

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AsyncPipe, MarkdownPipe],
  styleUrls: ['./chat-bubble.component.css'],
  template: `
    @let viewState = viewState$ | async;
    @let position = position$ | async;
    @let messages = messages$ | async;
    @let isLoading = !!(isLoading$ | async);
    @let expanded = viewState === 'expanded';
    @let side = position?.side ?? 'right';
    @let offsetY = position?.offsetY ?? 24;
    @let showTyping = shouldShowTypingBubble(messages, isLoading);

    <div
      class="chat-widget"
      [class.chat-widget--left]="side === 'left'"
      [class.chat-widget--right]="side === 'right'"
      [class.chat-widget--expanded]="expanded"
      [style.bottom.px]="offsetY"
    >
      @if (!expanded) {
        <button
          (click)="onLauncherClick()"
          (pointerdown)="onDragStart($event, 'launcher')"
          class="chat-launcher"
          [class.chat-launcher--dragging]="isDragging"
          aria-label="Abrir chat"
        >
          <svg class="chat-launcher-icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
          </svg>
        </button>
      }

      @if (expanded) {
        <div class="chat-panel" role="dialog" aria-label="Asistente de notas">
          <div
            class="chat-panel-header"
            (pointerdown)="onDragStart($event, 'header')"
          >
            <div class="chat-panel-identity">
              <div class="chat-avatar" aria-hidden="true">AI</div>
              <div class="chat-panel-meta">
                <span class="chat-panel-title">Asistente de notas</span>
                <span class="chat-panel-status">
                  <span class="chat-status-dot"></span>
                  En línea
                </span>
              </div>
            </div>
            <div class="chat-panel-actions">
              <button
                type="button"
                (click)="chatFacade.collapse()"
                title="Minimizar"
                aria-label="Minimizar"
              >
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/>
                </svg>
              </button>
              <button
                type="button"
                (click)="chatFacade.clearConversation()"
                title="Nueva conversación"
                aria-label="Nueva conversación"
              >
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
              </button>
              <button
                type="button"
                (click)="chatFacade.close()"
                title="Cerrar"
                aria-label="Cerrar"
              >
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="chat-messages" #messagesContainer>
            @if (!messages?.length && !isLoading) {
              <div class="chat-empty">
                <div class="chat-empty-icon" aria-hidden="true">
                  <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
                  </svg>
                </div>
                <p class="chat-empty-title">¡Hola! Soy tu asistente de notas.</p>
                <p class="chat-empty-sub">Pregúntame sobre tus notas, categorías o búsquedas.</p>
                <div class="chat-suggestions">
                  @for (s of suggestions; track s) {
                    <button type="button" (click)="sendSuggestion(s)" class="chat-suggestion-chip">
                      {{ s }}
                    </button>
                  }
                </div>
              </div>
            }
            @for (msg of messages ?? []; track msg.id) {
              <div
                class="chat-message"
                [class.chat-message--user]="msg.role === 'user'"
                [class.chat-message--assistant]="msg.role === 'assistant'"
              >
                <div class="chat-message-bubble">
                  @if (msg.role === 'user') {
                    <p class="chat-plain-text">{{ msg.text || '' }}</p>
                  } @else if (msg.streaming) {
                    <p class="chat-plain-text">{{ msg.text || '' }}</p>
                    @if (msg.text) {
                      <span class="chat-cursor" aria-hidden="true"></span>
                    }
                  } @else {
                    <div class="chat-markdown" [innerHTML]="msg.text | markdown"></div>
                  }
                </div>
              </div>
            }
            @if (showTyping) {
              <div class="chat-message chat-message--assistant">
                <div class="chat-typing-bubble" aria-live="polite" aria-label="Asistente escribiendo">
                  <span class="chat-typing-dot"></span>
                  <span class="chat-typing-dot"></span>
                  <span class="chat-typing-dot"></span>
                </div>
              </div>
            }
          </div>

          <div class="chat-input-area">
            <input
              #chatInput
              type="text"
              [(ngModel)]="inputText"
              (keydown.enter)="send()"
              placeholder="Escribe tu pregunta..."
              class="chat-input"
              autocomplete="off"
            />
            <button
              type="button"
              (click)="send()"
              [disabled]="!inputText.trim() || isLoading"
              class="chat-send-btn"
              aria-label="Enviar mensaje"
            >
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ChatBubbleComponent implements OnInit, OnDestroy, AfterViewChecked {
  protected readonly chatFacade = inject(ChatFacade);
  protected readonly shouldShowTypingBubble = shouldShowTypingBubble;

  protected readonly viewState$ = this.chatFacade.viewState$;
  protected readonly position$ = this.chatFacade.position$;
  protected readonly messages$ = this.chatFacade.messages$;
  protected readonly isLoading$ = this.chatFacade.isLoading$;

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;
  @ViewChild('chatInput') private chatInput?: ElementRef<HTMLInputElement>;

  protected inputText = '';
  protected isDragging = false;
  protected suggestions = [
    '¿Cuántas notas tengo?',
    '¿Qué notas tengo de trabajo?',
    '¿Qué anoté esta semana?',
    'Busca notas sobre reuniones',
  ];

  private dragPointerId: number | null = null;
  private dragStartY = 0;
  private dragStartOffsetY = 0;
  private dragMoved = false;
  private dragSide: ChatSide = 'right';
  private wasLoading = false;
  private subscriptions = new Subscription();
  private pendingFocus = false;

  ngOnInit(): void {
    this.subscriptions.add(
      this.viewState$.subscribe((state) => {
        if (state === 'expanded') {
          this.scheduleFocus();
        }
      }),
    );

    this.subscriptions.add(
      this.isLoading$.subscribe((loading) => {
        if (this.wasLoading && !loading) {
          this.scheduleFocus();
        }
        this.wasLoading = loading;
      }),
    );

    if (this.chatFacade.isOpen()) {
      this.scheduleFocus();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.endDrag();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
    if (this.pendingFocus) {
      this.pendingFocus = false;
      this.focusInput();
    }
  }

  protected onLauncherClick(): void {
    if (this.dragMoved) {
      return;
    }
    this.chatFacade.expand();
  }

  protected onDragStart(event: PointerEvent, source: 'launcher' | 'header'): void {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      return;
    }
    if (source === 'header' && (event.target as HTMLElement).closest('button')) {
      return;
    }

    event.preventDefault();
    this.isDragging = true;
    this.dragMoved = false;
    this.dragPointerId = event.pointerId;
    this.dragStartY = event.clientY;
    const current = this.chatFacade.getPosition();
    this.dragStartOffsetY = current.offsetY;
    this.dragSide = current.side;

    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  @HostListener('document:pointermove', ['$event'])
  onDocumentPointerMove(event: PointerEvent): void {
    if (this.dragPointerId === null || event.pointerId !== this.dragPointerId) {
      return;
    }

    const deltaY = this.dragStartY - event.clientY;
    if (Math.abs(deltaY) > DRAG_THRESHOLD_PX) {
      this.dragMoved = true;
    }

    const widgetHeight = this.chatFacade.isOpen() ? CHAT_PANEL_HEIGHT : CHAT_BUBBLE_SIZE;
    const rawOffset = this.dragStartOffsetY + deltaY;
    const maxOffset = Math.max(16, window.innerHeight - widgetHeight - 16);
    const clamped = Math.min(Math.max(rawOffset, 16), maxOffset);
    this.chatFacade.setPosition(this.dragSide, clamped);
  }

  @HostListener('document:pointerup', ['$event'])
  onDocumentPointerUp(event: PointerEvent): void {
    if (this.dragPointerId === null || event.pointerId !== this.dragPointerId) {
      return;
    }
    this.finishDrag(event.clientX);
  }

  @HostListener('document:pointercancel', ['$event'])
  onDocumentPointerCancel(event: PointerEvent): void {
    if (this.dragPointerId === null || event.pointerId !== this.dragPointerId) {
      return;
    }
    this.finishDrag(event.clientX);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.chatFacade.reclampPosition();
  }

  send(): void {
    if (this.inputText.trim()) {
      this.chatFacade.sendMessage(this.inputText);
      this.inputText = '';
      this.scheduleFocus();
    }
  }

  sendSuggestion(text: string): void {
    this.chatFacade.sendMessage(text);
    this.scheduleFocus();
  }

  private finishDrag(clientX: number): void {
    if (this.dragPointerId !== null && this.dragMoved) {
      const side: ChatSide = clientX < window.innerWidth / 2 ? 'left' : 'right';
      const current = this.chatFacade.getPosition();
      this.chatFacade.setPosition(side, current.offsetY);
    }
    this.endDrag();
  }

  private endDrag(): void {
    this.isDragging = false;
    this.dragPointerId = null;
    setTimeout(() => {
      this.dragMoved = false;
    }, 0);
  }

  private scheduleFocus(): void {
    this.pendingFocus = true;
  }

  private focusInput(): void {
    requestAnimationFrame(() => {
      this.chatInput?.nativeElement?.focus();
    });
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement as HTMLElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
