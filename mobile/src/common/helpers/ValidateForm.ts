/**
 * Validadores para formularios de registro (versión mobile)
 */

import type { RegisterFormData } from "../../types/medical";

// Types
export type FieldErrors = Record<string, string>;

// Constantes
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 50;

// Regex de validación
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

// Mensajes de error
export const ERROR_MESSAGES = {
  REQUIRED_NAME: "El nombre es obligatorio.",
  REQUIRED_EMAIL: "El email es obligatorio.",
  INVALID_EMAIL: "El email no es válido.",
  REQUIRED_RUT: "El RUT es obligatorio.",
  INVALID_RUT: "El RUT no es válido. Formato: 12.345.678-9",
  REQUIRED_ROLE: "El rol es obligatorio.",
  REQUIRED_PASSWORD: "La contraseña es obligatoria.",
  INVALID_PASSWORD: `La contraseña debe tener entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres, incluir mayúscula, minúscula y número.`,
  PASSWORD_MISMATCH: "Las contraseñas no coinciden.",
  REGISTRATION_ERROR: "Error al crear la cuenta. Intenta de nuevo.",
} as const;

// ------------------------------------------------------
// 🔹 VALIDACIONES
// ------------------------------------------------------

/** Valida formato de email */
export const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email);

/** Valida fuerza de contraseña */
export const validatePassword = (password: string): boolean => {
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return false;
  }
  return PASSWORD_REGEX.test(password);
};

/** Valida formato y dígito verificador de RUT chileno */
export const validateRUT = (rut: string): boolean => {
  const cleanRut = rut.replace(/\./g, '').trim();

  if (!/^\d{7,8}-[\dkK]$/.test(cleanRut)) {
    return false;
  }

  const [rutNumber, checkDigit] = cleanRut.split('-');

  let sum = 0;
  let multiplier = 2;

  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const calculatedCheckDigit = 11 - (sum % 11);
  let expectedCheckDigit: string;

  if (calculatedCheckDigit === 11) {
    expectedCheckDigit = '0';
  } else if (calculatedCheckDigit === 10) {
    expectedCheckDigit = 'K';
  } else {
    expectedCheckDigit = calculatedCheckDigit.toString();
  }

  return checkDigit.toUpperCase() === expectedCheckDigit;
};

/** Da formato 12.345.678-K al RUT (aunque se escriba sin puntos ni guion) */
export const formatRUT = (rut: string): string => {
  const cleaned = rut.replace(/[^\dkK]/g, '');
  if (cleaned.length === 0) return '';
  if (cleaned.length === 1) return cleaned;

  const body = cleaned.slice(0, -1);
  const checkDigit = cleaned.slice(-1).toUpperCase();

  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${checkDigit}`;
};


/** Valida campos básicos del formulario de registro */
export const validateBasicFields = (formData: RegisterFormData): FieldErrors => {
  const errors: FieldErrors = {};

  if (!formData.name.trim()) {
    errors.name = ERROR_MESSAGES.REQUIRED_NAME;
  }

  if (!formData.rut.trim()) {
    errors.rut = ERROR_MESSAGES.REQUIRED_RUT;
  } else if (!validateRUT(formData.rut)) {
    errors.rut = ERROR_MESSAGES.INVALID_RUT; 

  }

  if (!formData.email.trim()) {
    errors.email = ERROR_MESSAGES.REQUIRED_EMAIL;
  } else if (!validateEmail(formData.email)) {
    errors.email = ERROR_MESSAGES.INVALID_EMAIL;
  }

  if (!formData.password) {
    errors.password = ERROR_MESSAGES.REQUIRED_PASSWORD;
  } else if (!validatePassword(formData.password)) {
    errors.password = ERROR_MESSAGES.INVALID_PASSWORD;
  }

  if (formData.password && formData.confirmPassword !== formData.password) {
    errors.confirmPassword = ERROR_MESSAGES.PASSWORD_MISMATCH;
  }

  if (!formData.role) {
    errors.role = ERROR_MESSAGES.REQUIRED_ROLE;
  }
  

  return errors;
};

/** Valida el formulario completo de registro */
export const validateRegistrationForm = (formData: RegisterFormData) => {
  const errors = validateBasicFields(formData);
  const isValid = Object.keys(errors).length === 0;
  
  return { isValid, errors };
};
