import type { RegisterFormData } from "@/types/medical";

// Types
export type FieldErrors = Record<string, string>;

// Constants
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 50;

// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password regex pattern: at least one lowercase, one uppercase, and one digit
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;



// Error Messages
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
  REGISTRATION_ERROR: "Error al crear la cuenta. Intenta de nuevo."
} as const;

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns true if email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validates password strength
 * @param password - Password string to validate
 * @returns true if password meets requirements, false otherwise
 */
export const validatePassword = (password: string): boolean => {
  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return false;
  }
  return PASSWORD_REGEX.test(password);
};

/**
 * Validates Chilean RUT format and check digit
 * @param rut - RUT string to validate (e.g., "12345678-9")
 * @returns true if RUT is valid, false otherwise
 */
export const validateRUT = (rut: string): boolean => {
  // Remove dots and trim
  const cleanRut = rut.replace(/\./g, '').trim();
  
  // Check basic format: should have at least 8-9 digits, a hyphen, and a check digit
  if (!/^\d{7,8}-[\dkK]$/.test(cleanRut)) {
    return false;
  }

  // Split RUT and check digit
  const [rutNumber, checkDigit] = cleanRut.split('-');

  // Calculate check digit
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

/**
 * Formats RUT string to standard Chilean format (12.345.678-9)
 * @param rut - RUT string to format
 * @returns Formatted RUT string with dots and hyphen
 */
export const formatRUT = (rut: string): string => {
  // Remove all non-alphanumeric characters except K
  const cleaned = rut.replace(/[^\dkK]/g, '');
  
  if (cleaned.length === 0) return '';
  if (cleaned.length === 1) return cleaned;
  
  // Split into body and check digit
  const body = cleaned.slice(0, -1);
  const checkDigit = cleaned.slice(-1).toUpperCase();
  
  if (body.length === 0) return checkDigit;
  
  // Add dots to the body (format as thousands)
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedBody}-${checkDigit}`;
};

/**
 * Validates basic registration form fields
 * @param formData - Registration form data
 * @returns Object containing field errors, empty if no errors
 */
export const validateBasicFields = (formData: RegisterFormData): FieldErrors => {
  const errors: FieldErrors = {};

  // Validate name
  if (!formData.name.trim()) {
    errors.name = ERROR_MESSAGES.REQUIRED_NAME;
  }

  // Validate RUT
  if (!formData.rut.trim()) {
    errors.rut = ERROR_MESSAGES.REQUIRED_RUT;
  } else if (!validateRUT(formData.rut)) {
    errors.rut = ERROR_MESSAGES.INVALID_RUT;
  }

  // Validate email
  if (!formData.email.trim()) {
    errors.email = ERROR_MESSAGES.REQUIRED_EMAIL;
  } else if (!validateEmail(formData.email)) {
    errors.email = ERROR_MESSAGES.INVALID_EMAIL;
  }

  // Validate password
  if (!formData.password) {
    errors.password = ERROR_MESSAGES.REQUIRED_PASSWORD;
  } else if (!validatePassword(formData.password)) {
    errors.password = ERROR_MESSAGES.INVALID_PASSWORD;
  }

  // Validate password confirmation
  if (formData.password && formData.confirmPassword !== formData.password) {
    errors.confirmPassword = ERROR_MESSAGES.PASSWORD_MISMATCH;
  }

  // Validate role
  if (!formData.role) {
    errors.role = ERROR_MESSAGES.REQUIRED_ROLE;
  }

  return errors;
};

/**
 * Validates complete registration form
 * @param formData - Registration form data
 * @returns true if form is valid, false otherwise
 */
export const validateRegistrationForm = (formData: RegisterFormData): { isValid: boolean; errors: FieldErrors } => {
  const errors = validateBasicFields(formData);
  const isValid = Object.keys(errors).length === 0;
  
  return { isValid, errors };
};