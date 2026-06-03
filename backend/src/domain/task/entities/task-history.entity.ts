import { TaskHistoryEventType } from '../enums/task-history-event-type.enum';

export class TaskHistory {
  constructor(
    public readonly id: string,
    public readonly taskId: string,
    public readonly eventType: TaskHistoryEventType,
    public readonly previousValue: string | null,
    public readonly newValue: string | null,
    public readonly comment: string | null,
    public readonly userId: string | null,
    public readonly createdAt: Date,
  ) {}
}
