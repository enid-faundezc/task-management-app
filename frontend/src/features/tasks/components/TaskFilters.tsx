import { useState } from 'react';
import type { TaskFilters as TaskFiltersType } from '../types/task.filter';

interface Props {
  onChange: (filters: TaskFiltersType) => void;
}

export const TaskFilters = ({ onChange }: Props) => {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');

  const applyFilters = () => {
    onChange({
      title,
      status,
      page: 1,
      size: 10,
    });
  };

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <input
        placeholder="Search title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">All</option>
        <option value="CREATED">CREATED</option>
        <option value="ASSIGNED">ASSIGNED</option>
        <option value="IN_PROGRESS">IN PROGRESS</option>
        <option value="COMPLETED">COMPLETED</option>
      </select>

      <button onClick={applyFilters}>Filter</button>
    </div>
  );
};