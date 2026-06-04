import { useQuery } from '@tanstack/react-query';
import { getTasks, type TaskFilters } from '../api/tasks.api';

export const useTasks = (filters: TaskFilters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => getTasks(filters),
    placeholderData: (previousData) => previousData,
  });
};