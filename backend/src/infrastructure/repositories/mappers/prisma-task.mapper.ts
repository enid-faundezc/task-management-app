import { Task } from '../../../domain/task/entities/task.entity';
import { TaskHistory } from '../../../domain/task/entities/task-history.entity';

// 1. CORRECCIÓN DE IMPORTS: Se importan los tipos e inputs de Prisma, 
// y los Enums se extraen directamente desde el cliente.
import {
  Prisma,
  TaskPriority,
  TaskStatus,
  TaskHistoryEventType,
} from '@prisma/client';

import { TaskPriority as DomainPriority } from '../../../domain/task/enums/task-priority.enum';
import { TaskStatus as DomainStatus } from '../../../domain/task/enums/task-status.enum';
import { TaskHistoryEventType as DomainEventType } from '../../../domain/task/enums/task-history-event-type.enum';

export class PrismaTaskMapper {
  // =========================
  // DOMAIN -> PRISMA (CREATE)
  // =========================
  static toCreatePersistence(task: Task): Prisma.TaskCreateInput {
    return {
      id: task.id,
      title: task.title,
      description: task.description,

      priority: this.mapPriorityToPrisma(task.priority),
      status: this.mapStatusToPrisma(task.status),

      observations: task.observations,
      dueDate: task.dueDate,

      assignedUserId: task.assignedUserId,
      createdByUserId: task.createdByUserId,

      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  // =========================
  // DOMAIN -> PRISMA (UPDATE)
  // =========================
  static toUpdatePersistence(task: Task): Prisma.TaskUpdateInput {
    return {
      title: task.title,
      description: task.description,

      priority: this.mapPriorityToPrisma(task.priority),
      status: this.mapStatusToPrisma(task.status),

      observations: task.observations,
      dueDate: task.dueDate,

      assignedUserId: task.assignedUserId,

      updatedAt: new Date(),
    };
  }

  // =========================
  // DOMAIN -> PRISMA (HISTORY)
  // =========================
  static historyToPersistence(
    history: TaskHistory,
  ): Prisma.TaskHistoryCreateInput {
    return {
      id: history.id,
      // 2. CORRECCIÓN DE RELACIÓN: Prisma usa 'connect' para asociar claves foráneas en CreateInputs
      task: {
        connect: { id: history.taskId },
      },

      eventType: this.mapEventTypeToPrisma(history.eventType),

      previousValue: history.previousValue,
      newValue: history.newValue,
      comment: history.comment,
      userId: history.userId,

      createdAt: history.createdAt ?? new Date(),
    };
  }

  // =========================
  // PRISMA -> DOMAIN
  // =========================
  static toDomain(
    raw: Prisma.TaskGetPayload<{ include: { histories: true } }>,
  ): Task {
    const histories =
      raw.histories?.map(
        (h) =>
          new TaskHistory(
            h.id,
            h.taskId,
            this.mapEventTypeToDomain(h.eventType),
            h.previousValue,
            h.newValue,
            h.comment,
            h.userId,
            h.createdAt,
          ),
      ) ?? [];

    return new Task(
      raw.id,
      raw.title,
      raw.description,
      this.mapPriorityToDomain(raw.priority),
      this.mapStatusToDomain(raw.status),
      raw.createdByUserId,
      raw.observations ?? null,
      raw.dueDate ?? null,
      raw.assignedUserId ?? null,
      raw.createdAt,
      raw.updatedAt,
      histories,
    );
  }

  // =========================
  // EVENT TYPE MAPPERS
  // =========================
  private static mapEventTypeToPrisma(
    value: DomainEventType,
  ): TaskHistoryEventType {
    switch (value) {
      case DomainEventType.CREATED:
        return TaskHistoryEventType.CREATED;

      case DomainEventType.ASSIGNED:
        return TaskHistoryEventType.ASSIGNED;

      case DomainEventType.REASSIGNED:
        return TaskHistoryEventType.REASSIGNED;

      case DomainEventType.STATUS_CHANGED:
        return TaskHistoryEventType.STATUS_CHANGED;

      case DomainEventType.PRIORITY_CHANGED:
        return TaskHistoryEventType.PRIORITY_CHANGED;

      case DomainEventType.COMMENT_ADDED:
        return TaskHistoryEventType.COMMENT_ADDED;

      case DomainEventType.FIELD_CHANGED:
        return TaskHistoryEventType.FIELD_CHANGED;

      default:
        throw new Error('Unknown event type');
    }
  }

  private static mapEventTypeToDomain(
    value: TaskHistoryEventType,
  ): DomainEventType {
    switch (value) {
      case TaskHistoryEventType.CREATED:
        return DomainEventType.CREATED;

      case TaskHistoryEventType.ASSIGNED:
        return DomainEventType.ASSIGNED;

      case TaskHistoryEventType.REASSIGNED:
        return DomainEventType.REASSIGNED;

      case TaskHistoryEventType.STATUS_CHANGED:
        return DomainEventType.STATUS_CHANGED;

      case TaskHistoryEventType.PRIORITY_CHANGED:
        return DomainEventType.PRIORITY_CHANGED;

      case TaskHistoryEventType.COMMENT_ADDED:
        return DomainEventType.COMMENT_ADDED;

      case TaskHistoryEventType.FIELD_CHANGED:
        return DomainEventType.FIELD_CHANGED;

      default:
        throw new Error('Unknown event type');
    }
  }

  // =========================
  // PRIORITY MAPPERS
  // =========================
  private static mapPriorityToPrisma(value: DomainPriority): TaskPriority {
    switch (value) {
      case DomainPriority.LOW:
        return TaskPriority.LOW;
      case DomainPriority.MEDIUM:
        return TaskPriority.MEDIUM;
      case DomainPriority.HIGH:
        return TaskPriority.HIGH;
      case DomainPriority.CRITICAL:
        return TaskPriority.CRITICAL;
    }
  }

  private static mapPriorityToDomain(value: TaskPriority): DomainPriority {
    switch (value) {
      case TaskPriority.LOW:
        return DomainPriority.LOW;
      case TaskPriority.MEDIUM:
        return DomainPriority.MEDIUM;
      case TaskPriority.HIGH:
        return DomainPriority.HIGH;
      case TaskPriority.CRITICAL:
        return DomainPriority.CRITICAL;
      default:
        return DomainPriority.LOW; // Evita el error TS2366 (Falta return al final)
    }
  }

  // =========================
  // STATUS MAPPERS
  // =========================
  private static mapStatusToPrisma(value: DomainStatus): TaskStatus {
    switch (value) {
      case DomainStatus.CREATED:
        return TaskStatus.CREATED;
      case DomainStatus.ASSIGNED:
        return TaskStatus.ASSIGNED;
      case DomainStatus.IN_PROGRESS:
        return TaskStatus.IN_PROGRESS;
      case DomainStatus.STOPPED:
        return TaskStatus.STOPPED;
      case DomainStatus.COMPLETED:
        return TaskStatus.COMPLETED;
    }
  }

  private static mapStatusToDomain(value: TaskStatus): DomainStatus {
    switch (value) {
      case TaskStatus.CREATED:
        return DomainStatus.CREATED;
      case TaskStatus.ASSIGNED:
        return DomainStatus.ASSIGNED;
      case TaskStatus.IN_PROGRESS:
        return DomainStatus.IN_PROGRESS;
      case TaskStatus.STOPPED:
        return DomainStatus.STOPPED;
      case TaskStatus.COMPLETED:
        return DomainStatus.COMPLETED;
      default:
        return DomainStatus.CREATED; // Evita el error TS2366 (Falta return al final)
    }
  }
}
