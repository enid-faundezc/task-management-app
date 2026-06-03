import { Injectable } from '@nestjs/common';
import { CompleteTaskCommand } from '../commands/complete-task.command';
import { TaskRepository } from '../../../domain/task/repositories/task.repository';
import { TaskNotFoundException } from '../../../domain/task/exceptions/task-not-found.exception';
import { CompleteTaskResponseDto } from '../dto/complete-task-response.dto';

@Injectable()
export class CompleteTaskHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(
    command: CompleteTaskCommand,
  ): Promise<CompleteTaskResponseDto> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new TaskNotFoundException(command.taskId);
    }

    task.complete();

    await this.taskRepository.update(task);

    return {
      id: task.id,
      status: task.status,
      updatedAt: task.updatedAt,
    };
  }
}
