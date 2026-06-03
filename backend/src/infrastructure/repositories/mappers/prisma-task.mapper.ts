import { Task } from '../../../domain/task/entities/task.entity';
import { TaskHistory } from '../../../domain/task/entities/task-history.entity';

// EFC: Se crean las versiones de los tipos compatibles del evento tanto del model como de prisma
// dado que "CREATED" de Prisma ≠ "CREATED" del dominio
import { TaskHistoryEventType as PrismaEventType } from '@prisma/client';
import { TaskHistoryEventType as DomainEventType } from '../../../domain/task/enums/task-history-event-type.enum';

// EFC: Ojo, vamos a usar estos tipos para no usar any en el mapper, aunque el dominio
// no dependa de Prisma, el mapper sí puede usar estos tipos para mapear correctamente
// los datos entre el dominio y la base de datos.
import {
  Task as PrismaTask,
  TaskHistory as PrismaTaskHistory,
  TaskPriority as PrismaPriority,
  TaskStatus as PrismaStatus,
} from '@prisma/client';

import { TaskPriority as DomainPriority } from '../../../domain/task/enums/task-priority.enum';
import { TaskStatus as DomainStatus } from '../../../domain/task/enums/task-status.enum';

export class PrismaTaskMapper {
  // EFC: para DOMAIN <- PRISMA
  static toDomain(raw: PrismaTask & { histories: PrismaTaskHistory[] }): Task {
    // EFC: Mapeo de los eventos de historial asociados a la tarea
    const histories =
      raw.histories?.map(
        (h) =>
          new TaskHistory(
            h.id,
            h.taskId,
            PrismaTaskMapper.mapEventType(h.eventType), // EFC
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
      PrismaTaskMapper.mapPriority(raw.priority), // EFC: pasar de Prisma a dominio
      PrismaTaskMapper.mapStatus(raw.status), // EFC: pasar de Prisma a dominio
      raw.createdByUserId,
      raw.observations ?? null,
      raw.dueDate ?? null,
      raw.assignedUserId ?? null,
      raw.createdAt,
      raw.updatedAt,
      histories,
    );
  }

  // EFC: Pasa de DOMAIN -> PRISMA (TASK)
  static toPersistence(task: Task) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      observations: task.observations,
      dueDate: task.dueDate,
      assignedUserId: task.assignedUserId,
      createdByUserId: task.createdByUserId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  // EFC: Pasa de DOMAIN -> PRISMA (HISTORY)
  static historyToPersistence(history: TaskHistory) {
    return {
      id: history.id,
      taskId: history.taskId,
      eventType: history.eventType,
      previousValue: history.previousValue,
      newValue: history.newValue,
      comment: history.comment,
      userId: history.userId,
      createdAt: history.createdAt,
    };
  }

  // EFC: Mapeo de los tipos de eventos entre Prisma y el dominio
  private static mapEventType(value: PrismaEventType): DomainEventType {
    switch (value) {
      case 'CREATED':
        return DomainEventType.CREATED;
      case 'ASSIGNED':
        return DomainEventType.ASSIGNED;
      case 'REASSIGNED':
        return DomainEventType.REASSIGNED;
      case 'STATUS_CHANGED':
        return DomainEventType.STATUS_CHANGED;
      case 'PRIORITY_CHANGED':
        return DomainEventType.PRIORITY_CHANGED;
      case 'COMMENT_ADDED':
        return DomainEventType.COMMENT_ADDED;
      default: {
        // EFC: En caso de que venga un tipo desconocido, lo mejor es lanzar un error
        // no se puede usar default porque el dominio no tiene un valor por defecto para esto,
        // y si llega un valor desconocido es mejor fallar rápido.
        throw new Error('Unknown event type');
      }
    }
  }

  // EFC: Mapeo de los tipos de prioridad entre Prisma y el dominio
  private static mapPriority(value: PrismaPriority): DomainPriority {
    switch (value) {
      case 'LOW':
        return DomainPriority.LOW;
      case 'MEDIUM':
        return DomainPriority.MEDIUM;
      case 'HIGH':
        return DomainPriority.HIGH;
      case 'CRITICAL':
        return DomainPriority.CRITICAL;
      default: {
        throw new Error('Unknown priority type');
      }
    }
  }

  // EFC: Mapeo de los tipos de estado entre Prisma y el dominio
  private static mapStatus(value: PrismaStatus): DomainStatus {
    switch (value) {
      case 'CREATED':
        return DomainStatus.CREATED;
      case 'ASSIGNED':
        return DomainStatus.ASSIGNED;
      case 'IN_PROGRESS':
        return DomainStatus.IN_PROGRESS;
      case 'STOPPED':
        return DomainStatus.STOPPED;
      case 'COMPLETED':
        return DomainStatus.COMPLETED;
      default: {
        throw new Error('Unknown status type');
      }
    }
  }
}
