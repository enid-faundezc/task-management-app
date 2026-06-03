import { TaskFilters } from '../../../domain/task/repositories/task-filters';

export class GetTasksQuery {
  constructor(public readonly filters: TaskFilters) {}
}
