import { describe, expect, it } from 'vitest';
import { shouldShowTypingBubble } from '../../application/chat-typing.util';
import { ChatMessage } from '../../domain/chat-message.model';

describe('shouldShowTypingBubble', () => {
  it('should not show typing when not loading', () => {
    expect(shouldShowTypingBubble([], false)).toBe(false);
  });

  it('should show typing during welcome load with no messages', () => {
    expect(shouldShowTypingBubble([], true)).toBe(true);
  });

  it('should show typing while assistant stream has no text yet', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', text: 'Hola', timestamp: new Date() },
      {
        id: '2',
        role: 'assistant',
        text: '',
        timestamp: new Date(),
        streaming: true,
      },
    ];
    expect(shouldShowTypingBubble(messages, true)).toBe(true);
  });

  it('should hide typing once assistant stream has text', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', text: 'Hola', timestamp: new Date() },
      {
        id: '2',
        role: 'assistant',
        text: 'Respuesta parcial',
        timestamp: new Date(),
        streaming: true,
      },
    ];
    expect(shouldShowTypingBubble(messages, true)).toBe(false);
  });

  it('should hide typing when last message is user', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', text: 'Hola', timestamp: new Date() },
    ];
    expect(shouldShowTypingBubble(messages, true)).toBe(false);
  });
});
