import { AuthUser } from 'src/shared/auth/auth-user.interface';

export class AddTaskCommentCommand {
  constructor(
    public readonly taskId: string,
    public readonly comment: string,
    public readonly user: AuthUser,
  ) {}
}
