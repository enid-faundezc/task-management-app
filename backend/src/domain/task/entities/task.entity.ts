import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';

export class Task {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public observations: string | null,
    public priority: TaskPriority,
    public status: TaskStatus,
    public dueDate: Date | null,
    public assignedUserId: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  assign(userId: string): void {
    this.assignedUserId = userId;
    this.status = TaskStatus.ASSIGNED;
  }

  start(): void {
    this.status = TaskStatus.IN_PROGRESS;
  }

  complete(): void {
    this.status = TaskStatus.COMPLETED;
  }

  stop(): void {
    this.status = TaskStatus.STOPPED;
  }
}
