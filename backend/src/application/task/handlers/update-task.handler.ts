import { UpdateTaskCommand } from '../commands/update-task.command';
import { TaskRepository } from 'src/domain/task/repositories/task.repository';
import { TaskMapper } from '../mappers/task.mapper';
import { TaskResponseDto } from '../dto/task-response.dto';
import { TaskStatus } from 'src/domain/task/enums/task-status.enum';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class UpdateTaskHandler {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: UpdateTaskCommand): Promise<TaskResponseDto> {
    const { taskId, dto, user } = command;

    // Buscar tarea
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Roles
    const isAdmin = user.roles.includes('ADMIN');
    const isOwner = task.createdByUserId === user.userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You cannot update this task');
    }

    // 3. Regla de estado (recomendado)
    if (task.status === TaskStatus.COMPLETED) {
      throw new ForbiddenException('Completed tasks cannot be updated');
    }

    // 4. Aplicar cambios al dominio (RECOMENDADO)
    task.update({
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate,
      observations: dto.observations,
    });

    // 5. Persistir entidad completa
    await this.taskRepository.update(taskId, task);

    // 6. Return DTO
    return TaskMapper.toResponse(task);
  }
}
