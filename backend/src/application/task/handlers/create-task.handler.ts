import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';

import { CreateTaskCommand } from '../commands/create-task.command';

import { Task } from '../../../domain/task/entities/task.entity';
import { TaskStatus } from '../../../domain/task/enums/task-status.enum';
import { TaskRepository } from '../../../domain/task/repositories/task.repository';

import { TaskPriority } from '../../../domain/task/enums/task-priority.enum';

@Injectable()
export class CreateTaskHandler {
  constructor(private readonly repository: TaskRepository) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    const dto = command.dto;
    const now = new Date();

    const task = new Task(
      randomUUID(),
      dto.title,
      dto.description,
      dto.priority ?? TaskPriority.MEDIUM,
      dto.observations ?? null,
      TaskStatus.CREATED,
      dto.dueDate ? new Date(dto.dueDate) : null,
      dto.assignedUserId ?? null,
      now,
      now,
    );

    return await this.repository.save(task);
  }
}
