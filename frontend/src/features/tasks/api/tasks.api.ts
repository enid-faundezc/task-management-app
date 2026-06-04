import { http } from '../../../api/http';

export interface TaskFilters {
  page?: number;
  size?: number;
  status?: string;
  priority?: string;
  title?: string;
}

export const getTasks = async (filters: TaskFilters) => {
  const { data } = await http.get('/tasks', {
    params: filters,
  });

  return data;
};