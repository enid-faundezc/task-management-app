import { Injectable } from '@nestjs/common';
import { TaskRepository } from 'src/domain/task/repositories/task.repository';
import { GetTaskHistoryQuery } from '../queries/get-task-history.query';
import { TaskHistory } from 'src/domain/task/entities/task-history.entity';

@Injectable()
export class GetTaskHistoryHandler {
  constructor(private readonly repository: TaskRepository) {}

  async execute(query: GetTaskHistoryQuery): Promise<TaskHistory[]> {
    const task = await this.repository.findOrFail(query.taskId);

    return [...task.getHistory()];
  }
}
