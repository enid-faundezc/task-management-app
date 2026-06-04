import { AuthUser } from 'src/shared/auth/auth-user.interface';
import { TaskFilters } from '../../../domain/task/repositories/task-filters';

export class GetTasksQuery {
  constructor(
    public readonly filters: TaskFilters,
    public readonly user: AuthUser,
  ) {}
}
