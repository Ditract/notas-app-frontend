import { Nota, CreateNotaData, UpdateNotaData } from './nota.model';
import { EstadisticasResponse } from './estadisticas.model';
import { Observable } from 'rxjs';

export abstract class NotesRepository {
  abstract list(): Observable<Nota[]>;
  abstract create(data: CreateNotaData): Observable<Nota>;
  abstract update(id: number, data: UpdateNotaData): Observable<Nota>;
  abstract remove(id: number): Observable<void>;
  abstract buscar(keyword: string): Observable<Nota[]>;
  abstract recientes(limit: number): Observable<Nota[]>;
  abstract porCategoria(categoria: string): Observable<Nota[]>;
  abstract estadisticas(): Observable<EstadisticasResponse>;
  abstract favoritas(): Observable<Nota[]>;
}