import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'notePreview',
  standalone: true,
})
export class NotePreviewPipe implements PipeTransform {
  transform(value: string, maxLength: number = 150): string {
    if (!value) return '';
    const plain = value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return plain.length > maxLength
      ? plain.substring(0, maxLength) + '...'
      : plain;
  }
}