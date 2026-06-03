import { Injectable } from '@nestjs/common';
import { StopTaskCommand } from '../commands/stop-task.command';
import { TaskRepository } from 'src/domain/task/repositories/task.repository';
import { TaskNotFoundException } from 'src/domain/task/exceptions/task-not-found.exception';

@Injectable()
export class StopTaskHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: StopTaskCommand): Promise<void> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new TaskNotFoundException(command.taskId);
    }

    task.stop();

    await this.taskRepository.update(task);
  }
}
