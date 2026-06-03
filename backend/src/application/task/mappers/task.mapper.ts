import { Task } from '../../../domain/task/entities/task.entity';
import { TaskResponseDto } from '../dto/task-response.dto';

export class TaskMapper {
  static toResponse(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      assignedUserId: task.assignedUserId,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
