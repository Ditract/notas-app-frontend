import { Pipe, PipeTransform } from '@angular/core';
import { sanitizeHtml } from '../utils/html-sanitize.config';

@Pipe({
  name: 'sanitizeHtml',
  standalone: true,
})
export class SanitizeHtmlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return sanitizeHtml(value);
  }
}