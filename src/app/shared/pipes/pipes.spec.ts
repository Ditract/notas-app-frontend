import { describe, it, expect } from 'vitest';
import { StripHtmlPipe } from './strip-html.pipe';
import { NotePreviewPipe } from './note-preview.pipe';

describe('StripHtmlPipe', () => {
  const pipe = new StripHtmlPipe();

  it('should strip HTML tags from string', () => {
    expect(pipe.transform('<p>Hello <b>World</b></p>')).toBe('Hello World');
  });

  it('should return empty string for null/undefined', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should handle plain text without tags', () => {
    expect(pipe.transform('Hello World')).toBe('Hello World');
  });
});

describe('NotePreviewPipe', () => {
  const pipe = new NotePreviewPipe();

  it('should create preview from HTML content', () => {
    expect(pipe.transform('<p>Hello World</p>')).toBe('Hello World');
  });

  it('should truncate long content with ellipsis', () => {
    const longContent = 'A'.repeat(200);
    const result = pipe.transform(longContent, 50);
    expect(result.length).toBeLessThanOrEqual(53);
    expect(result).toContain('...');
  });

  it('should return empty string for empty input', () => {
    expect(pipe.transform('')).toBe('');
  });
});