import { Injectable } from '@angular/core';
import {
  CHAT_BUBBLE_SIZE,
  CHAT_MIN_OFFSET_Y,
  CHAT_PANEL_HEIGHT,
  ChatPreferences,
  ChatSide,
  ChatViewState,
  DEFAULT_CHAT_PREFERENCES,
} from '../domain/chat-preferences.model';

@Injectable({ providedIn: 'root' })
export class ChatPreferencesStorage {
  private readonly STORAGE_KEY = 'notas-chat-preferences';

  load(): ChatPreferences {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        return { ...DEFAULT_CHAT_PREFERENCES };
      }
      const parsed = JSON.parse(raw) as Partial<ChatPreferences>;
      return this.normalize(parsed);
    } catch {
      return { ...DEFAULT_CHAT_PREFERENCES };
    }
  }

  save(preferences: ChatPreferences): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
  }

  clampOffsetY(offsetY: number, expanded: boolean): number {
    const widgetHeight = expanded ? CHAT_PANEL_HEIGHT : CHAT_BUBBLE_SIZE;
    const maxOffset = Math.max(
      CHAT_MIN_OFFSET_Y,
      window.innerHeight - widgetHeight - CHAT_MIN_OFFSET_Y,
    );
    return Math.min(Math.max(offsetY, CHAT_MIN_OFFSET_Y), maxOffset);
  }

  private normalize(partial: Partial<ChatPreferences>): ChatPreferences {
    const viewState: ChatViewState =
      partial.viewState === 'expanded' ? 'expanded' : 'collapsed';
    const side: ChatSide = partial.side === 'left' ? 'left' : 'right';
    const offsetY =
      typeof partial.offsetY === 'number' && Number.isFinite(partial.offsetY)
        ? partial.offsetY
        : DEFAULT_CHAT_PREFERENCES.offsetY;

    return {
      viewState,
      side,
      offsetY: this.clampOffsetY(offsetY, viewState === 'expanded'),
    };
  }
}
