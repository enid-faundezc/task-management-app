import { AuthUser } from 'src/shared/auth/auth-user.interface';

export class CompleteTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly user: AuthUser,
  ) {}
}
