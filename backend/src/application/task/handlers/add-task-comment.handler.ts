import { Injectable } from '@nestjs/common';
import { AddTaskCommentCommand } from '../commands/add-task-comment.command';

import { TaskRepository } from '../../../domain/task/repositories/task.repository';
import { TaskNotFoundException } from '../../../domain/task/exceptions/task-not-found.exception';

@Injectable()
export class AddTaskCommentHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: AddTaskCommentCommand): Promise<void> {
    const task = await this.taskRepository.findById(command.taskId);

    if (!task) {
      throw new TaskNotFoundException(command.taskId);
    }

    task.addComment(command.comment);

    await this.taskRepository.update(task);
  }
}
