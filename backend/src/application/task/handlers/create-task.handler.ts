import { Injectable } from '@nestjs/common';

import { CreateTaskCommand } from '../commands/create-task.command';
import { TaskFactory } from '../../../domain/task/factories/task.factory';
import { TaskRepository } from '../../../domain/task/repositories/task.repository';
import { CreateTaskResponseDto } from '../dto/create-task-response.dto';

@Injectable()
export class CreateTaskHandler {
  constructor(
    private readonly taskFactory: TaskFactory,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(command: CreateTaskCommand): Promise<CreateTaskResponseDto> {
    const dto = command.dto;

    const task = this.taskFactory.create(
      dto.title,
      dto.description,
      dto.priority,
      dto.observations,
      dto.dueDate ? new Date(dto.dueDate) : undefined,
      dto.assignedUserId,
    );

    await this.taskRepository.save(task);
    // EFC: Podríamos usar un mapper para convertir la entidad a DTO,
    // pero dado que es un caso simple, lo hacemos manualmente aquí.
    // Lo dejaré pendiente.
    const response = new CreateTaskResponseDto();
    response.id = task.id;
    response.title = task.title;
    response.status = task.status;
    response.createdAt = task.createdAt;

    return response;
  }
}
