import { Injectable } from '@nestjs/common';
import { TaskRepository } from 'src/domain/task/repositories/task.repository';
import { StartTaskCommand } from '../commands/start-task.command';
import { TaskNotFoundException } from 'src/domain/task/exceptions/task-not-found.exception';

@Injectable()
export class StartTaskHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: StartTaskCommand): Promise<void> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new TaskNotFoundException(command.taskId);
    }

    task.start();

    await this.taskRepository.update(task);
  }
}
