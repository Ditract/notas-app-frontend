import { Observable } from 'rxjs';

export abstract class FavoritesRepository {
  abstract listFavoriteIds(): Observable<number[]>;
  abstract addFavorite(noteId: number): Observable<void>;
  abstract removeFavorite(noteId: number): Observable<void>;
}