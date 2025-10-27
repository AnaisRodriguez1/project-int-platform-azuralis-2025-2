/**
 * Validates Chilean RUT using modulo 11 algorithm
 * @param rut - RUT string with format XX.XXX.XXX-X or XXXXXXXXX
 * @returns boolean indicating if RUT is valid
 */
export function validateRut(rut: string): boolean {
  // Remove dots and hyphens
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  
  // Validate minimum length
  if (cleanRut.length < 2) {
    return false;
  }
  
  // Extract number and verifier digit
  const rutNumber = cleanRut.slice(0, -1);
  const verifierDigit = cleanRut.slice(-1);

  // Validate that number part contains only digits
  if (!/^\d+$/.test(rutNumber)) {
    return false;
  }

  // Calculate expected verifier digit using modulo 11
  let sum = 0;
  let multiplier = 2;

  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const calculatedVerifier = 11 - remainder;

  let expectedVerifier: string;
  if (calculatedVerifier === 11) {
    expectedVerifier = '0';
  } else if (calculatedVerifier === 10) {
    expectedVerifier = 'K';
  } else {
    expectedVerifier = calculatedVerifier.toString();
  }

  return verifierDigit === expectedVerifier;
}

/**
 * Formats RUT with standard Chilean format XX.XXX.XXX-X
 * @param rut - RUT string
 * @returns formatted RUT string
 */
export function formatRut(rut: string): string {
  // Remove all non-alphanumeric characters
  const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (cleanRut.length < 2) {
    return cleanRut;
  }
  
  // Extract number and verifier
  const number = cleanRut.slice(0, -1);
  const verifier = cleanRut.slice(-1);
  
  // Add dots to number (from right to left)
  const formattedNumber = number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedNumber}-${verifier}`;
}

/**
 * Cleans RUT removing dots and hyphens
 * @param rut - RUT string
 * @returns clean RUT string
 */
export function cleanRut(rut: string): string {
  return rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
}
