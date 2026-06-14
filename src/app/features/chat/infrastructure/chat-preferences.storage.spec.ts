import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatPreferencesStorage } from './chat-preferences.storage';
import {
  CHAT_BUBBLE_SIZE,
  CHAT_PANEL_HEIGHT,
  DEFAULT_CHAT_PREFERENCES,
} from '../domain/chat-preferences.model';

describe('ChatPreferencesStorage', () => {
  let storage: ChatPreferencesStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = new ChatPreferencesStorage();
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
  });

  it('should return defaults when localStorage is empty', () => {
    expect(storage.load()).toEqual(DEFAULT_CHAT_PREFERENCES);
  });

  it('should persist and restore preferences', () => {
    storage.save({ viewState: 'expanded', side: 'left', offsetY: 48 });
    expect(storage.load()).toEqual({ viewState: 'expanded', side: 'left', offsetY: 48 });
  });

  it('should normalize invalid stored values', () => {
    localStorage.setItem(
      'notas-chat-preferences',
      JSON.stringify({ viewState: 'invalid', side: 'center', offsetY: 'bad' }),
    );
    expect(storage.load()).toEqual({
      viewState: 'collapsed',
      side: 'right',
      offsetY: DEFAULT_CHAT_PREFERENCES.offsetY,
    });
  });

  it('should return defaults when stored JSON is corrupt', () => {
    localStorage.setItem('notas-chat-preferences', '{not-json');
    expect(storage.load()).toEqual(DEFAULT_CHAT_PREFERENCES);
  });

  it('should clamp offsetY for expanded panel within viewport', () => {
    const max = 800 - CHAT_PANEL_HEIGHT - 16;
    expect(storage.clampOffsetY(9999, true)).toBe(max);
    expect(storage.clampOffsetY(0, true)).toBe(16);
  });

  it('should clamp offsetY for collapsed bubble within viewport', () => {
    const max = 800 - CHAT_BUBBLE_SIZE - 16;
    expect(storage.clampOffsetY(9999, false)).toBe(max);
  });
});
