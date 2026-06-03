import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';
import { randomUUID } from 'crypto';
import { TaskHistory } from './task-history.entity';
import { TaskHistoryEventType } from '../enums/task-history-event-type.enum';
import { InvalidTaskStateException } from '../exceptions/invalid-task-state.exception';

// EFC: La entidad Task representa una tarea en el sistema de gestión de tareas.
// Posee los eventos porque es el aggregate root y es responsable de mantener
// la consistencia del agregado.
// La historia de eventos se almacena internamente en un array privado,
// y se expone a través del método getHistory() como un array de solo
// lectura para evitar modificaciones externas.

export class Task {
  private readonly history: TaskHistory[];

  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public priority: TaskPriority,
    public status: TaskStatus,
    public observations: string | null,
    public dueDate: Date | null,
    public assignedUserId: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    history?: TaskHistory[],
  ) {
    this.history = history ?? [];
  }

  // EFC: Obtener el historial de eventos de la tarea
  getHistory(): ReadonlyArray<TaskHistory> {
    return this.history;
  }

  // EFC: Método interno para registrar eventos
  protected registerHistory(
    eventType: TaskHistoryEventType,
    previousValue: string | null,
    newValue: string | null,
    comment: string | null,
    userId: string | null,
  ): void {
    this.history.push(
      new TaskHistory(
        randomUUID(),
        this.id,
        eventType,
        previousValue,
        newValue,
        comment,
        userId,
        new Date(),
      ),
    );
  }

  // EFC: método para asignar la tarea a un usuario, si ya tiene es
  // una reasignación, si no es una asignación inicial.
  assign(userId: string): void {
    // EFC: Si la tarea ya está completada, se lanza una excepción.
    if (this.status === TaskStatus.COMPLETED) {
      throw new InvalidTaskStateException('Completed tasks cannot be assigned');
    }

    const previousUser = this.assignedUserId;
    this.assignedUserId = userId;
    this.status = TaskStatus.ASSIGNED;
    this.updatedAt = new Date();

    // EFC: Se registra el evento en el historial de la tarea.
    this.registerHistory(
      previousUser
        ? TaskHistoryEventType.REASSIGNED
        : TaskHistoryEventType.ASSIGNED,
      previousUser,
      userId,
      null,
      userId,
    );
  }

  // EFC: Método start para iniciar la tarea (pasar a estado en proceso)
  start(): void {
    // EFC: Si la tarea no está asignada no se puede iniciar, se lanza una excepción.
    if (this.status !== TaskStatus.ASSIGNED) {
      throw new InvalidTaskStateException('Only ASSIGNED tasks can be started');
    }

    // EFC: Se guarda el estado anterior para registrar
    // el cambio en el historial.
    const previousStatus = this.status;
    this.status = TaskStatus.IN_PROGRESS;
    this.updatedAt = new Date();

    // EFC: Se registra el evento en el historial de la tarea.
    this.registerHistory(
      TaskHistoryEventType.STATUS_CHANGED,
      previousStatus,
      this.status,
      null,
      this.assignedUserId,
    );
  }

  // EFC: Método stop para detener la tarea (pasar a estado detenido)
  stop(): void {
    if (this.status !== TaskStatus.IN_PROGRESS) {
      throw new InvalidTaskStateException(
        'Only IN_PROGRESS tasks can be stopped',
      );
    }

    const previousStatus = this.status; // EFC: Se guarda el estado anterior
    this.status = TaskStatus.STOPPED;
    this.updatedAt = new Date();

    // EFC: Se registra el evento en el historial de la tarea.
    this.registerHistory(
      TaskHistoryEventType.STATUS_CHANGED,
      previousStatus,
      this.status,
      null,
      this.assignedUserId,
    );
  }

  // EFC: Método resume para reanudar la tarea (pasar de detenido a en proceso)
  resume(): void {
    if (this.status !== TaskStatus.STOPPED) {
      throw new InvalidTaskStateException('Only STOPPED tasks can be resumed');
    }

    const previousStatus = this.status;
    this.status = TaskStatus.IN_PROGRESS;
    this.updatedAt = new Date();

    // EFC: Se registra el evento en el historial de la tarea.
    this.registerHistory(
      TaskHistoryEventType.STATUS_CHANGED,
      previousStatus,
      this.status,
      null,
      this.assignedUserId,
    );
  }

  // EFC: Método complete para completar la tarea (pasar a estado completada)
  complete(): void {
    // EFC: Solo se pueden completar tareas que estén en proceso, si no se lanza una excepción.
    if (this.status !== TaskStatus.IN_PROGRESS) {
      throw new InvalidTaskStateException(
        'Only IN_PROGRESS tasks can be completed',
      );
    }

    const previousStatus = this.status;
    this.status = TaskStatus.COMPLETED;
    this.updatedAt = new Date();

    // EFC: Se registra el evento en el historial de la tarea.
    this.registerHistory(
      TaskHistoryEventType.STATUS_CHANGED,
      previousStatus,
      this.status,
      null,
      this.assignedUserId,
    );
  }

  // EFC: Método changePriority
  changePriority(priority: TaskPriority): void {
    // EFC: No se puede cambiar la prioridad de una tarea que ya está completada,
    // si se intenta se lanza una excepción.
    if (this.status === TaskStatus.COMPLETED) {
      throw new InvalidTaskStateException(
        'Cannot change priority of completed tasks',
      );
    }

    const previousPriority = this.priority;
    this.priority = priority;
    this.updatedAt = new Date();

    // EFC: Se registra el evento en el historial de la tarea.
    this.registerHistory(
      TaskHistoryEventType.PRIORITY_CHANGED,
      previousPriority,
      priority,
      null,
      this.assignedUserId,
    );
  }

  // EFC: Método addComment
  addComment(comment: string): void {
    this.updatedAt = new Date();

    // EFC: Se registra el evento en el historial de la tarea.
    this.registerHistory(
      TaskHistoryEventType.COMMENT_ADDED,
      null,
      null,
      comment,
      this.assignedUserId,
    );
  }

  // EFC: Toda tarea debe generar un evento CREATED
  recordCreated(): void {
    this.registerHistory(
      TaskHistoryEventType.CREATED,
      null,
      this.status,
      null,
      this.assignedUserId,
    );
  }
}
