import { ForbiddenException, Injectable } from '@nestjs/common';
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
    const { user } = command;
    const isAdmin = user.roles.includes('ADMIN');

    if (!task) {
      throw new TaskNotFoundException(command.taskId);
    }

    const canExecute = isAdmin || task.assignedUserId === user.userId;

    if (!canExecute) {
      throw new ForbiddenException();
    }

    task.complete();

    await this.taskRepository.update(command.taskId, task);

    return {
      id: task.id,
      status: task.status,
      updatedAt: task.updatedAt,
    };
  }
}
