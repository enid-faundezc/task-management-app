import { IsEnum } from 'class-validator';
import { TaskPriority } from 'src/domain/task/enums/task-priority.enum';

export class ChangeTaskPriorityDto {
  @IsEnum(TaskPriority)
  priority!: TaskPriority;
}
