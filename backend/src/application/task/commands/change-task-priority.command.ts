import { TaskPriority } from '../../../domain/task/enums/task-priority.enum';

export class ChangeTaskPriorityCommand {
  constructor(
    public readonly taskId: string,
    public readonly priority: TaskPriority,
  ) {}
}
