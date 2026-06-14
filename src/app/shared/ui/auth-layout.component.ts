import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-shell">
      <div class="auth-shell__blob auth-shell__blob--1" aria-hidden="true"></div>
      <div class="auth-shell__blob auth-shell__blob--2" aria-hidden="true"></div>
      <div class="auth-shell__blob auth-shell__blob--3" aria-hidden="true"></div>

      <div class="auth-card">
        <ng-content />
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
