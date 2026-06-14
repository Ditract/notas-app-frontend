import '@angular/compiler';
import { createEnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { ChatFacade } from './chat.facade';
import { ChatRepository } from '../domain/chat.repository';
import { ChatPreferencesStorage } from '../infrastructure/chat-preferences.storage';
import { CHAT_PANEL_HEIGHT } from '../domain/chat-preferences.model';

function createFacade(): ChatFacade {
  const injector = createEnvironmentInjector(
    [
      ChatFacade,
      ChatPreferencesStorage,
      {
        provide: ChatRepository,
        useValue: {
          sendMessage: vi.fn(() => of('')),
          fetchWelcome: vi.fn(() => of({ respuesta: 'Hola', sessionId: 's1' })),
          notifyContextual: vi.fn(() => of({ respuesta: 'Ok', sessionId: 's1' })),
        },
      },
    ],
    null,
  );
  return runInInjectionContext(injector, () => inject(ChatFacade));
}

describe('ChatFacade', () => {
  let saveSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    saveSpy = vi.spyOn(ChatPreferencesStorage.prototype, 'save');
  });

  it('should start collapsed by default', () => {
    const facade = createFacade();
    expect(facade.isOpen()).toBe(false);
  });

  it('should expand and persist expanded state', () => {
    const facade = createFacade();
    facade.expand();
    expect(facade.isOpen()).toBe(true);
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({ viewState: 'expanded' }),
    );
  });

  it('should collapse and persist collapsed state', () => {
    const facade = createFacade();
    facade.expand();
    saveSpy.mockClear();
    facade.collapse();
    expect(facade.isOpen()).toBe(false);
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({ viewState: 'collapsed' }),
    );
  });

  it('should toggle between expanded and collapsed', () => {
    const facade = createFacade();
    facade.toggle();
    expect(facade.isOpen()).toBe(true);
    facade.toggle();
    expect(facade.isOpen()).toBe(false);
  });

  it('should update and persist position', () => {
    const facade = createFacade();
    facade.setPosition('left', 80);
    expect(facade.getPosition()).toEqual({ side: 'left', offsetY: 80 });
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({ side: 'left', offsetY: 80 }),
    );
  });

  it('should restore expanded state from storage on init', () => {
    localStorage.setItem(
      'notas-chat-preferences',
      JSON.stringify({ viewState: 'expanded', side: 'right', offsetY: 32 }),
    );

    const facade = createFacade();
    expect(facade.isOpen()).toBe(true);
    expect(facade.getPosition()).toEqual({ side: 'right', offsetY: 32 });
  });

  it('should reclamp offsetY when expanding from a high bubble position', () => {
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
    localStorage.setItem(
      'notas-chat-preferences',
      JSON.stringify({ viewState: 'collapsed', side: 'right', offsetY: 700 }),
    );

    const facade = createFacade();
    expect(facade.getPosition().offsetY).toBe(700);

    facade.expand();

    const maxExpandedOffset = 800 - CHAT_PANEL_HEIGHT - 16;
    expect(facade.getPosition().offsetY).toBe(maxExpandedOffset);
    expect(facade.getPosition().offsetY).toBeLessThan(700);
  });
});
