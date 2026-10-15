'use server';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { validateClass } from '@/lib/domain/validation.mjs';
export type ClassState = { error: string; success: string };
export async function createClass(_state: ClassState, data: FormData): Promise<ClassState> {
  const result = validateClass(Object.fromEntries(data));
  if (result.error || !result.value)
    return { error: result.error || 'Invalid details.', success: '' };
  const { supabase } = await requireUser();
  const v = result.value;
  const { error } = await supabase.rpc('create_school_class', {
    p_school: v.schoolId,
    p_year: v.year,
    p_grade: v.grade,
    p_name: v.name,
    p_key: v.operationId,
  });
  if (error)
    return {
      error:
        error.code === '23505'
          ? 'That class name already exists, or these details changed during a retry. Refresh and try again.'
          : error.code === '42501'
            ? 'School administrator access is required. Your permissions may have changed.'
            : 'We could not create the class. Please try again.',
      success: '',
    };
  revalidatePath('/workspace');
  return { error: '', success: `Class ${v.name} is ready.` };
}
