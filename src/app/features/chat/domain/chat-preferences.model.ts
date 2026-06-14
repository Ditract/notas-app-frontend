export type ChatViewState = 'expanded' | 'collapsed';
export type ChatSide = 'left' | 'right';

export interface ChatPreferences {
  viewState: ChatViewState;
  side: ChatSide;
  offsetY: number;
}

export interface ChatPosition {
  side: ChatSide;
  offsetY: number;
}

export const CHAT_PANEL_HEIGHT = 560;
export const CHAT_BUBBLE_SIZE = 56;
export const CHAT_DEFAULT_OFFSET_Y = 24;
export const CHAT_MIN_OFFSET_Y = 16;

export const DEFAULT_CHAT_PREFERENCES: ChatPreferences = {
  viewState: 'collapsed',
  side: 'right',
  offsetY: CHAT_DEFAULT_OFFSET_Y,
};
