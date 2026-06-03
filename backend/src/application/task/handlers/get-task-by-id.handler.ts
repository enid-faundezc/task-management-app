import { Injectable } from '@nestjs/common';
import { TaskMapper } from '../mappers/task.mapper';
import { GetTaskByIdQuery } from '../queries/get-task-by-id.query';
import { TaskRepository } from 'src/domain/task/repositories/task.repository';
import { TaskResponseDto } from '../dto/task-response.dto';

@Injectable()
export class GetTaskByIdHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(query: GetTaskByIdQuery): Promise<TaskResponseDto> {
    const task = await this.taskRepository.findById(query.taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    return TaskMapper.toResponse(task);
  }
}
