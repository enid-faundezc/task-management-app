import { useState } from 'react';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { TaskFilters } from '../features/tasks/components/TaskFilters';
import { TaskTable } from '../features/tasks/components/TaskTable';

export const TasksPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    size: 10,
  });

  const { data, isLoading } = useTasks(filters);

  return (
    <div>
      <h1>Tasks</h1>

      <TaskFilters onChange={setFilters} />

      {isLoading && <p>Loading...</p>}

      <TaskTable tasks={data?.items ?? []} />
    </div>
  );
};