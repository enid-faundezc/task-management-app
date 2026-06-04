import { ForbiddenException, Injectable } from '@nestjs/common';
import { TaskRepository } from 'src/domain/task/repositories/task.repository';
import { StartTaskCommand } from '../commands/start-task.command';
import { TaskNotFoundException } from 'src/domain/task/exceptions/task-not-found.exception';

@Injectable()
export class StartTaskHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: StartTaskCommand): Promise<void> {
    const task = await this.taskRepository.findById(command.taskId);
    const { user } = command;
    const isAdmin = user.roles.includes('ADMIN');

    if (!task) {
      throw new TaskNotFoundException(command.taskId);
    }

    // EFC: El admin cambia estado a todas, el usuario solo a la que tiene asignada
    const canExecute = isAdmin || task.assignedUserId === user.userId;

    if (!canExecute) {
      throw new ForbiddenException();
    }

    task.start();

    await this.taskRepository.update(task);
  }
}
