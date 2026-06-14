import { describe, expect, it } from 'vitest';
import { extractSseEventData, flushSseBuffer, parseSseBuffer } from './sse-parser';

describe('sse-parser', () => {
  it('should strip only the optional SSE space after data colon', () => {
    expect(extractSseEventData('data: Hola')).toBe('Hola');
  });

  it('should preserve leading spaces in payload when encoded after SSE separator', () => {
    expect(extractSseEventData('data:  Hola')).toBe(' Hola');
    expect(extractSseEventData('data:  puedo')).toBe(' puedo');
  });

  it('should preserve content without space after data colon', () => {
    expect(extractSseEventData('data:Hola')).toBe('Hola');
  });

  it('should join multiple data lines with newline', () => {
    expect(extractSseEventData('data: linea1\ndata: linea2')).toBe('linea1\nlinea2');
  });

  it('should parse complete SSE events separated by blank line', () => {
    const input = 'data: ¡Hola!\n\ndata: ¿En qué\n\ndata:  puedo ayudarte?\n\n';
    const { events, remaining } = parseSseBuffer(input);

    expect(events).toEqual(['¡Hola!', '¿En qué', ' puedo ayudarte?']);
    expect(remaining).toBe('');
  });

  it('should parse Spring SSE events with CRLF terminators', () => {
    const input = 'data: ¡Hola!\r\n\r\ndata:  ¿En\r\n\r\ndata: qué\r\n\r\n';
    const { events, remaining } = parseSseBuffer(input);

    expect(events).toEqual(['¡Hola!', ' ¿En', 'qué']);
    expect(remaining).toBe('');
  });

  it('should emit leading-space token from Spring CRLF event', () => {
    const input = 'data:  ¿En\r\n\r\n';
    const { events } = parseSseBuffer(input);

    expect(events).toEqual([' ¿En']);
  });

  it('should keep incomplete events in buffer', () => {
    const input = 'data: parcial\n\ndata: incom';
    const { events, remaining } = parseSseBuffer(input);

    expect(events).toEqual(['parcial']);
    expect(remaining).toBe('data: incom');
  });

  it('should keep incomplete CRLF events in buffer', () => {
    const input = 'data: parcial\r\n\r\ndata: incom';
    const { events, remaining } = parseSseBuffer(input);

    expect(events).toEqual(['parcial']);
    expect(remaining).toBe('data: incom');
  });

  it('should flush remaining buffer on stream end', () => {
    expect(flushSseBuffer('data: final')).toEqual(['final']);
    expect(flushSseBuffer('data:  con espacio')).toEqual([' con espacio']);
    expect(flushSseBuffer('data: final\r\n')).toEqual(['final']);
  });
});
