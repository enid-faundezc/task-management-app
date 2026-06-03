export class AddTaskCommentCommand {
  constructor(
    public readonly taskId: string,
    public readonly comment: string,
  ) {}
}
