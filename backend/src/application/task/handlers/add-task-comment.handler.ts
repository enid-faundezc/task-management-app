import { ForbiddenException, Injectable } from '@nestjs/common';
import { AddTaskCommentCommand } from '../commands/add-task-comment.command';

import { TaskRepository } from '../../../domain/task/repositories/task.repository';
import { TaskNotFoundException } from '../../../domain/task/exceptions/task-not-found.exception';

@Injectable()
export class AddTaskCommentHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: AddTaskCommentCommand): Promise<void> {
    const task = await this.taskRepository.findById(command.taskId);
    const { user } = command;

    if (!task) {
      throw new TaskNotFoundException(command.taskId);
    }

    // EFC: usuario solo a la que tiene asignada o la que creó
    const canExecute =
      task.createdByUserId === user.userId ||
      task.assignedUserId === user.userId;

    if (!canExecute) {
      throw new ForbiddenException();
    }

    task.addComment(command.comment);

    await this.taskRepository.update(command.taskId, task);
  }
}
