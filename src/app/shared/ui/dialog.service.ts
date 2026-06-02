import { Component, inject } from '@angular/core';
import {
  Overlay,
  OverlayRef,
  OverlayModule,
} from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { TemplateRef } from '@angular/core';

@Component({
  selector: 'app-dialog-service',
  standalone: true,
  template: '',
})
export class DialogService {
  private readonly overlay = inject(Overlay);

  open(component: ComponentType<unknown>): OverlayRef {
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
    });

    return overlayRef;
  }
}