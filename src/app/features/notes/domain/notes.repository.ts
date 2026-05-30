import { Nota, CreateNotaData, UpdateNotaData } from './nota.model';
import { Observable } from 'rxjs';

export abstract class NotesRepository {
  abstract list(): Observable<Nota[]>;
  abstract create(data: CreateNotaData): Observable<Nota>;
  abstract update(id: number, data: UpdateNotaData): Observable<Nota>;
  abstract remove(id: number): Observable<void>;
}