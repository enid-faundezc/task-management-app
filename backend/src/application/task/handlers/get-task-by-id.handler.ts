import { ForbiddenException, Injectable } from '@nestjs/common';
import { TaskMapper } from '../mappers/task.mapper';
import { GetTaskByIdQuery } from '../queries/get-task-by-id.query';
import { TaskRepository } from 'src/domain/task/repositories/task.repository';
import { TaskResponseDto } from '../dto/task-response.dto';

@Injectable()
export class GetTaskByIdHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(query: GetTaskByIdQuery): Promise<TaskResponseDto> {
    const { user } = query;
    const task = await this.taskRepository.findById(query.taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    const isAdmin = user.roles.includes('ADMIN');

    const canAccess =
      isAdmin ||
      task.createdByUserId === user.userId ||
      task.assignedUserId === user.userId;

    //EFC: Si es usuario, solo puede ver sus task
    if (!canAccess) {
      throw new ForbiddenException('No access to this task');
    }

    return TaskMapper.toResponse(task);
  }
}
