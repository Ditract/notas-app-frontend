import { AbstractControl, ValidationErrors } from '@angular/forms';
import { inject } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../../core/config/app-config.token';

export function emailValidator(control: AbstractControl): ValidationErrors | null {
  const config = inject(APP_CONFIG);
  const value = control.value as string;
  if (!value) return null;
  return config.validation.emailPattern.test(value)
    ? null
    : { email: 'El email no es válido' };
}

export function passwordValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const config = inject(APP_CONFIG);
  const value = control.value as string;
  if (!value) return null;

  const errors: ValidationErrors = {};
  if (value.length < config.validation.passwordMinLength) {
    errors['passwordMinLength'] = {
      message: `Mínimo ${config.validation.passwordMinLength} caracteres`,
    };
  }
  if (value.length > config.validation.passwordMaxLength) {
    errors['passwordMaxLength'] = {
      message: `Máximo ${config.validation.passwordMaxLength} caracteres`,
    };
  }
  if (!config.validation.passwordPattern.test(value)) {
    errors['passwordPattern'] = {
      message:
        'Debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial',
    };
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

export function nombreValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const config = inject(APP_CONFIG);
  const value = (control.value as string)?.trim() ?? '';
  if (!value) return { required: 'El nombre es obligatorio' };
  if (value.length < config.validation.nombreMinLength) {
    return { nombreMinLength: { message: `Mínimo ${config.validation.nombreMinLength} caracteres` } };
  }
  if (value.length > config.validation.nombreMaxLength) {
    return { nombreMaxLength: { message: `Máximo ${config.validation.nombreMaxLength} caracteres` } };
  }
  return null;
}

export function tituloValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const config = inject(APP_CONFIG);
  const value = (control.value as string)?.trim() ?? '';
  if (!value) return { required: 'El título es obligatorio' };
  if (value.length > config.validation.tituloMaxLength) {
    return { tituloMaxLength: { message: `Máximo ${config.validation.tituloMaxLength} caracteres` } };
  }
  return null;
}

export function contenidoValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const config = inject(APP_CONFIG);
  const value = (control.value as string)?.trim() ?? '';
  if (!value) return { required: 'El contenido es obligatorio' };
  if (value.length > config.validation.contenidoMaxLength) {
    return { contenidoMaxLength: { message: `Máximo ${config.validation.contenidoMaxLength} caracteres` } };
  }
  return null;
}