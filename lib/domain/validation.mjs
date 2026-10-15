export const roles = ['school_admin', 'teacher', 'learner', 'parent'];
export const gradeCodes = ['R', ...Array.from({ length: 12 }, (_, i) => String(i + 1))];
export function safeNext(value) {
  return typeof value === 'string' &&
    /^\/workspace(?:[/?]|$)/.test(value) &&
    !value.includes('\\') &&
    !/[\r\n]/.test(value)
    ? value
    : '/workspace';
}
export function validateClass(input) {
  const schoolId = String(input.schoolId || '');
  const name = String(input.name || '').trim();
  const grade = String(input.grade || '');
  const year = Number(input.year);
  const operationId = String(input.operationId || '');
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(schoolId) || !uuid.test(operationId))
    return { error: 'Select a school and try again.' };
  if (!name || name.length > 80) return { error: 'Enter a class name of 1–80 characters.' };
  if (!gradeCodes.includes(grade)) return { error: 'Choose a valid grade.' };
  if (!Number.isInteger(year) || year < 2020 || year > 2100)
    return { error: 'Enter a calendar year between 2020 and 2100.' };
  return { value: { schoolId, name, grade, year, operationId } };
}
