import { describe, it, expect } from 'vitest';
import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  const pipe = new MarkdownPipe();

  it('should render GFM table with table tags', () => {
    const markdown = `| Título | Categoría | Fecha |
| --- | --- | --- |
| Reunión | TRABAJO | 15 ene 2024 |`;

    const html = pipe.transform(markdown);
    expect(html).toContain('<table');
    expect(html).toContain('Reunión');
    expect(html).toContain('TRABAJO');
  });

  it('should render plain text as paragraphs', () => {
    const html = pipe.transform('Hola **mundo**');
    expect(html).toContain('mundo');
    expect(html).not.toContain('**');
  });

  it('should strip script tags from malicious markdown', () => {
    const html = pipe.transform('<script>alert("x")</script>\n\nTexto seguro');
    expect(html).not.toContain('<script');
    expect(html).toContain('Texto seguro');
  });

  it('should wrap tables for horizontal scroll', () => {
    const markdown = `| A | B |
| --- | --- |
| 1 | 2 |`;
    const html = pipe.transform(markdown);
    expect(html).toContain('chat-table-wrap');
  });

  it('should decorate category cells with pill classes', () => {
    const markdown = `| Título | Categoría | Fecha |
| --- | --- | --- |
| Nota | TRABAJO | 15 ene |`;
    const html = pipe.transform(markdown);
    expect(html).toContain('chat-cat-pill--trabajo');
  });

  it('should return empty string for null or empty input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform('')).toBe('');
  });
});
