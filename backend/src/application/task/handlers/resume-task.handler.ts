import { Injectable } from '@nestjs/common';
import { TaskRepository } from 'src/domain/task/repositories/task.repository';
import { ResumeTaskCommand } from '../commands/resume-task.command';
import { TaskNotFoundException } from 'src/domain/task/exceptions/task-not-found.exception';

@Injectable()
export class ResumeTaskHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: ResumeTaskCommand): Promise<void> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new TaskNotFoundException(command.taskId);
    }

    task.resume();

    await this.taskRepository.update(task);
  }
}
