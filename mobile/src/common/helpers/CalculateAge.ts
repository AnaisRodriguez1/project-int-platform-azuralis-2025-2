/**
 * Calcula la edad a partir de una fecha de nacimiento en formato 'YYYY-MM-DD'
 * @param dateOfBirth Fecha de nacimiento (ej: "1998-04-23")
 * @returns Edad actual como número entero
 */
export function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;

  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}
