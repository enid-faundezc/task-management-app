import { Injectable } from '@nestjs/common';
import { TaskRepository } from 'src/domain/task/repositories/task.repository';
import { ChangeTaskPriorityCommand } from '../commands/change-task-priority.command';
import { TaskNotFoundException } from 'src/domain/task/exceptions/task-not-found.exception';

@Injectable()
export class ChangeTaskPriorityHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: ChangeTaskPriorityCommand): Promise<void> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new TaskNotFoundException(command.taskId);
    }

    task.changePriority(command.priority);

    await this.taskRepository.update(command.taskId, task);
  }
}
