import { Observable } from 'rxjs';
import { Perfil, ChangePasswordData } from './perfil.model';

export abstract class ProfileRepository {
  abstract getMyProfile(): Observable<Perfil>;
  abstract updateName(nombre: string): Observable<Perfil>;
  abstract changePassword(data: ChangePasswordData): Observable<void>;
}