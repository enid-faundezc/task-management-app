import { Injectable } from '@nestjs/common';
import { AssignTaskCommand } from '../commands/assign-task.command';
import { TaskRepository } from '../../../domain/task/repositories/task.repository';
import { TaskNotFoundException } from '../../../domain/task/exceptions/task-not-found.exception';

@Injectable()
export class AssignTaskHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: AssignTaskCommand): Promise<void> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new TaskNotFoundException(command.taskId);
    }

    task.assign(command.userId);

    await this.taskRepository.update(task);
  }
}
