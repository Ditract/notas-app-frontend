import { Pipe, PipeTransform } from '@angular/core';
import DOMPurify from 'dompurify';

@Pipe({
  name: 'sanitizeHtml',
  standalone: true,
})
export class SanitizeHtmlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [
        'b', 'i', 'u', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
        's', 'strike', 'sub', 'sup', 'span', 'div', 'mark',
      ],
      ALLOWED_ATTR: ['href', 'target', 'style', 'class'],
    });
  }
}