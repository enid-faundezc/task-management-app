import { randomUUID } from 'crypto';

import { Task } from '../entities/task.entity';

import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';
import { InvalidTaskCreationException } from '../exceptions/invalid-task-creation.exception';

// EFC: La clase TaskFactory es responsable de crear instancias de Task
// con las validaciones necesarias.

export class TaskFactory {
  create(
    title: string,
    description: string,
    priority?: TaskPriority,
    observations?: string | null,
    dueDate?: Date | null,
    assignedUserId?: string | null,
  ): Task {
    // EFC: Validaciones básicas para la creación de una tarea.
    this.validateTitle(title);
    this.validateDescription(description);
    this.validateDueDate(dueDate);

    const now = new Date();

    // EFC: Si no se proporciona una prioridad, se asigna MEDIUM por defecto.
    const task = new Task(
      randomUUID(),
      title.trim(),
      description.trim(),
      priority ?? TaskPriority.MEDIUM,
      assignedUserId ? TaskStatus.ASSIGNED : TaskStatus.CREATED,
      observations ?? null,
      dueDate ?? null,
      assignedUserId ?? null,
      now,
      now,
    );

    task.recordCreated(); // EFC: Registrar el evento de creación en el historial.

    return task;
  }

  // EFC: Validación del título
  private validateTitle(title: string): void {
    if (!title?.trim()) {
      throw new InvalidTaskCreationException('Title is required');
    }

    if (title.trim().length < 5) {
      throw new InvalidTaskCreationException(
        'Title must contain at least 5 characters',
      );
    }

    if (title.trim().length > 200) {
      throw new InvalidTaskCreationException(
        'Title cannot exceed 200 characters',
      );
    }
  }

  // EFC: Validación de la descripción
  private validateDescription(description: string): void {
    if (!description?.trim()) {
      throw new InvalidTaskCreationException('Description is required');
    }

    if (description.trim().length < 10) {
      throw new InvalidTaskCreationException(
        'Description must contain at least 10 characters',
      );
    }

    if (description.trim().length > 500) {
      throw new InvalidTaskCreationException(
        'Description cannot exceed 500 characters',
      );
    }
  }

  // EFC: Validar fecha compromiso, debe ser una fecha futura o nula.
  // No se permiten fechas pasadas.
  private validateDueDate(dueDate?: Date | null): void {
    if (!dueDate) {
      return;
    }

    const today = new Date();

    if (dueDate <= today) {
      throw new InvalidTaskCreationException(
        'DueDate must be greater than current date',
      );
    }
  }
}
