import { ForbiddenException, Injectable } from '@nestjs/common';
import { StopTaskCommand } from '../commands/stop-task.command';
import { TaskRepository } from 'src/domain/task/repositories/task.repository';
import { TaskNotFoundException } from 'src/domain/task/exceptions/task-not-found.exception';

@Injectable()
export class StopTaskHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: StopTaskCommand): Promise<void> {
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

    task.stop();

    await this.taskRepository.update(command.taskId, task);
  }
}
