import { Task } from '../entities/task.entity';
import { TaskStatus } from '../enums/task-status.enum';

export abstract class TaskRepository {
  abstract save(task: Task): Promise<Task>;

  abstract findById(id: string): Promise<Task | null>;

  abstract findAll(
    page: number,
    size: number,
    status?: TaskStatus,
    search?: string,
  ): Promise<Task[]>;
}
