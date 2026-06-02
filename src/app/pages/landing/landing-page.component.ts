import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <div class="mx-auto max-w-4xl text-center">
        <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent-light)] px-4 py-1.5 text-sm font-medium" style="color: var(--accent)">
          <span>📝</span> Tu espacio para pensar y crear
        </div>

        <h1 class="mb-6 text-4xl font-bold leading-tight sm:text-5xl" style="color: var(--text-primary)">
          Organiza tus ideas<br>
          <span style="color: var(--accent)">con NOTASAPP</span>
        </h1>

        <p class="mx-auto mb-10 max-w-2xl text-lg" style="color: var(--text-secondary)">
          Crea, edita y organiza tus notas personales con un editor enriquecido.
          Marca tus favoritas, busca al instante y accede desde cualquier lugar.
          Tu conocimiento, siempre a mano.
        </p>

        <div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            routerLink="/register"
            class="btn btn-primary btn-lg px-8 no-underline"
          >
            Crear cuenta gratis
          </a>
          <a
            routerLink="/login"
            class="btn btn-secondary btn-lg px-8 no-underline"
          >
            Iniciar sesión
          </a>
        </div>

        <div class="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div class="card p-6 text-center">
            <div class="mb-3 text-3xl">✏️</div>
            <h3 class="mb-2 text-base font-semibold" style="color: var(--text-primary)">Editor enriquecido</h3>
            <p class="text-sm" style="color: var(--text-muted)">Formato de texto, listas, títulos y más con nuestro editor potente.</p>
          </div>
          <div class="card p-6 text-center">
            <div class="mb-3 text-3xl">⭐</div>
            <h3 class="mb-2 text-base font-semibold" style="color: var(--text-primary)">Favoritos</h3>
            <p class="text-sm" style="color: var(--text-muted)">Marca tus notas favoritas y accede a ellas rápidamente.</p>
          </div>
          <div class="card p-6 text-center">
            <div class="mb-3 text-3xl">🔒</div>
            <h3 class="mb-2 text-base font-semibold" style="color: var(--text-primary)">Seguro y privado</h3>
            <p class="text-sm" style="color: var(--text-muted)">Tus notas están protegidas y solo tú puedes acceder a ellas.</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LandingPageComponent {}