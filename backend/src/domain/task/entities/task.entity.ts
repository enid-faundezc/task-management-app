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

  // EFC: Error y solución: Este Array es para almacenar eventos pendientes de persistencia
  // esto porque al ser los eventos parte del agregado, al actualizar se procesan
  // todos nuevamente, por ende se necesita una forma de diferenciar los eventos
  // que ya se han persistido en la BD de los nuevos eventos generados por las operaciones del agregado.
  private pendingHistory: TaskHistory[] = [];

  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public priority: TaskPriority,
    public status: TaskStatus,
    public readonly createdByUserId: string,
    public observations: string | null,
    public dueDate: Date | null,
    public assignedUserId: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    history?: TaskHistory[],
  ) {
    // EFC: Corrección de error, se inicializa el historial con un array vacío si no se proporciona,
    // de lo contrario viene de la BD
    this.history = history ?? [];

    this.pendingHistory = []; // EFC: Parte vacía.
  }

  // EFC: Obtener el historial de eventos de la tarea
  getHistory(): ReadonlyArray<TaskHistory> {
    return [...this.history].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  // EFC: Método para obtener solo los eventos pendientes de persistencia
  getPendingHistory(): ReadonlyArray<TaskHistory> {
    return this.pendingHistory;
  }

  // EFC: Método para limpiar los eventos pendientes después de que se hayan persistido
  clearPendingHistory(): void {
    this.pendingHistory = [];
  }

  // EFC: Método interno para registrar eventos
  protected registerHistory(
    eventType: TaskHistoryEventType,
    previousValue: string | null,
    newValue: string | null,
    comment: string | null,
    userId: string | null,
  ): void {
    const history = new TaskHistory(
      randomUUID(),
      this.id,
      eventType,
      previousValue,
      newValue,
      comment,
      userId,
      new Date(),
    );

    this.history.push(history);
    this.pendingHistory.push(history); // EFC: Se agrega a pendientes para persistir luego.
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

  update(data: {
    title?: string;
    description?: string;
    dueDate?: Date;
    observations?: string;
  }) {
    //EFC: Se auditan todos los cambios
    if (data.title && data.title !== this.title) {
      const oldValue = this.title;
      this.title = data.title;

      this.registerHistory(
        TaskHistoryEventType.FIELD_CHANGED,
        oldValue,
        this.title,
        'title',
        this.assignedUserId,
      );
    }

    // DESCRIPTION
    if (data.description && data.description !== this.description) {
      const oldValue = this.description;
      this.description = data.description;

      this.registerHistory(
        TaskHistoryEventType.FIELD_CHANGED,
        oldValue,
        this.description,
        'description',
        this.assignedUserId,
      );
    }

    // DUE DATE
    if (data.dueDate && data.dueDate !== this.dueDate) {
      const oldValue = this.dueDate;

      this.dueDate = data.dueDate;

      this.registerHistory(
        TaskHistoryEventType.FIELD_CHANGED,
        oldValue ? oldValue.toISOString() : null,
        data.dueDate.toISOString(),
        'dueDate',
        this.assignedUserId,
      );
    }

    // OBSERVATIONS
    if (data.observations && data.observations !== this.observations) {
      const oldValue = this.observations;
      this.observations = data.observations;

      this.registerHistory(
        TaskHistoryEventType.FIELD_CHANGED,
        oldValue,
        this.observations,
        'observations',
        this.assignedUserId,
      );
    }

    this.updatedAt = new Date();
  }
}
