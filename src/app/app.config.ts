import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/http/jwt.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { AuthRepository } from './features/auth/domain/auth.repository';
import { HttpAuthRepository } from './features/auth/infrastructure/http-auth.repository';
import { NotesRepository } from './features/notes/domain/notes.repository';
import { HttpNotesRepository } from './features/notes/infrastructure/http-notes.repository';
import { FavoritesRepository } from './features/notes/domain/favorites.repository';
import { HttpFavoritesRepository } from './features/notes/infrastructure/http-favorites.repository';
import { ProfileRepository } from './features/profile/domain/profile.repository';
import { HttpProfileRepository } from './features/profile/infrastructure/http-profile.repository';
import { ChatRepository } from './features/chat/domain/chat.repository';
import { HttpChatRepository } from './features/chat/infrastructure/http-chat.repository';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    { provide: AuthRepository, useClass: HttpAuthRepository },
    { provide: NotesRepository, useClass: HttpNotesRepository },
    { provide: FavoritesRepository, useClass: HttpFavoritesRepository },
    { provide: ProfileRepository, useClass: HttpProfileRepository },
    { provide: ChatRepository, useClass: HttpChatRepository },
  ],
};