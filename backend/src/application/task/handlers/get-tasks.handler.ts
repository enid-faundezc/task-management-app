import { Injectable } from '@nestjs/common';
import { GetTasksQuery } from '../queries/get-tasks.query';
import { PaginatedTaskResponseDto } from '../dto/paginated-task-response.dto';
import { TaskRepository } from '../../../domain/task/repositories/task.repository';
import { TaskMapper } from '../mappers/task.mapper';

@Injectable()
export class GetTasksHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(query: GetTasksQuery): Promise<PaginatedTaskResponseDto> {
    const result = await this.taskRepository.findAll(query.filters);

    return {
      data: result.data.map((task) => TaskMapper.toResponse(task)),
      total: result.total,
      page: result.page,
      size: result.size,
    };
  }
}
