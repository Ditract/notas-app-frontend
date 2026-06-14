/**
 * Normaliza terminadores de línea SSE (Spring usa \r\n) a \n.
 */
export function normalizeSseBuffer(buffer: string): string {
  return buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Extrae el payload de un bloque SSE sin eliminar espacios significativos.
 * Respeta el espacio opcional tras "data:" según la especificación SSE.
 */
export function extractSseEventData(eventBlock: string): string | null {
  const dataLines: string[] = [];

  for (const line of normalizeSseBuffer(eventBlock).split('\n')) {
    if (line.startsWith('data:')) {
      const value = line.startsWith('data: ') ? line.slice(6) : line.slice(5);
      dataLines.push(value);
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  return dataLines.join('\n');
}

/**
 * Procesa texto acumulado del stream y devuelve eventos completos y el buffer restante.
 */
export function parseSseBuffer(buffer: string): { events: string[]; remaining: string } {
  const events: string[] = [];
  const separator = '\n\n';
  let remaining = normalizeSseBuffer(buffer);
  let separatorIndex = remaining.indexOf(separator);

  while (separatorIndex !== -1) {
    const eventBlock = remaining.slice(0, separatorIndex);
    remaining = remaining.slice(separatorIndex + separator.length);

    const data = extractSseEventData(eventBlock);
    if (data !== null) {
      events.push(data);
    }

    separatorIndex = remaining.indexOf(separator);
  }

  return { events, remaining };
}

/**
 * Procesa cualquier evento incompleto que quede al cerrar el stream.
 */
export function flushSseBuffer(buffer: string): string[] {
  if (!buffer) {
    return [];
  }

  const data = extractSseEventData(buffer);
  return data !== null ? [data] : [];
}
