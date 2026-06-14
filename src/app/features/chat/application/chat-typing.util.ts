import { ChatMessage } from '../domain/chat-message.model';

export function shouldShowTypingBubble(
  messages: ChatMessage[] | null | undefined,
  isLoading: boolean,
): boolean {
  if (!isLoading) {
    return false;
  }
  const list = messages ?? [];
  if (list.length === 0) {
    return true;
  }
  const last = list[list.length - 1];
  return last.role === 'assistant' && last.streaming === true && !last.text.trim();
}
