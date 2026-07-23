import DOMPurify from 'dompurify';

const BASE_ALLOWED_TAGS = [
  'b',
  'i',
  'u',
  'em',
  'strong',
  'a',
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'code',
  'pre',
  's',
  'strike',
  'sub',
  'sup',
  'span',
  'div',
  'mark',
] as const;

const TABLE_ALLOWED_TAGS = ['table', 'thead', 'tbody', 'tr', 'th', 'td'] as const;

const ALLOWED_ATTR = ['href', 'target', 'style', 'class', 'colspan', 'rowspan'];

export function sanitizeHtml(value: string, options?: { allowTables?: boolean }): string {
  const allowTables = options?.allowTables ?? false;
  const allowedTags = allowTables
    ? [...BASE_ALLOWED_TAGS, ...TABLE_ALLOWED_TAGS]
    : [...BASE_ALLOWED_TAGS];

  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR,
  });
}
