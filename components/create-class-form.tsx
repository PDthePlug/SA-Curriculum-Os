'use client';
import { useActionState } from 'react';
import { Plus, LoaderCircle } from 'lucide-react';
import { createClass } from '@/app/workspace/actions';
export function CreateClassForm({
  schoolId,
  operationId,
  year,
}: {
  schoolId: string;
  operationId: string;
  year: number;
}) {
  const [state, action, pending] = useActionState(createClass, { error: '', success: '' });
  return (
    <form action={action} className="class-form">
      <input type="hidden" name="schoolId" value={schoolId} />
      <input type="hidden" name="operationId" value={operationId} />
      <div className="form-field">
        <label htmlFor="class-name">Class name</label>
        <input id="class-name" name="name" placeholder="e.g. 12A" maxLength={80} required />
      </div>
      <div className="form-field">
        <label htmlFor="grade">Grade</label>
        <select id="grade" name="grade" defaultValue="12">
          {['R', ...Array.from({ length: 12 }, (_, i) => String(i + 1))].map((g) => (
            <option value={g} key={g}>
              {g === 'R' ? 'Grade R' : `Grade ${g}`}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="year">Calendar year</label>
        <input
          id="year"
          name="year"
          type="number"
          min={2020}
          max={2100}
          defaultValue={year}
          required
        />
      </div>
      <button type="submit" className="button button-dark" disabled={pending}>
        {pending ? <LoaderCircle size={16} className="spin" /> : <Plus size={16} />}Create class
      </button>
      <div className="form-message">
        {state.error && (
          <p role="alert" className="form-error">
            {state.error}
          </p>
        )}
        {state.success && (
          <p role="status" className="form-success">
            {state.success}
          </p>
        )}
      </div>
    </form>
  );
}
