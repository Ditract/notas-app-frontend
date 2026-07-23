import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import { CATEGORIAS } from '../../features/notes/domain/categoria.constantes';
import { sanitizeHtml } from '../utils/html-sanitize.config';

marked.setOptions({
  gfm: true,
  breaks: true,
});

function decorateCategoryPills(html: string): string {
  let result = html;
  for (const cat of CATEGORIAS) {
    const slug = cat.toLowerCase();
    const re = new RegExp(`(<td>)(\\s*${cat}\\s*)(</td>)`, 'gi');
    result = result.replace(
      re,
      `$1<span class="chat-cat-pill chat-cat-pill--${slug}">$2</span>$3`,
    );
  }
  return result;
}

function wrapTables(html: string): string {
  return html.replace(/<table/g, '<div class="chat-table-wrap"><table').replace(/<\/table>/g, '</table></div>');
}

@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    const rawHtml = marked.parse(value, { async: false }) as string;
    const withPills = decorateCategoryPills(wrapTables(rawHtml));
    return sanitizeHtml(withPills, { allowTables: true });
  }
}
