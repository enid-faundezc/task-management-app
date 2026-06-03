export class TaskNotFoundException extends Error {
  constructor(taskId: string) {
    super(`Task ${taskId} not found`);
  }
}
