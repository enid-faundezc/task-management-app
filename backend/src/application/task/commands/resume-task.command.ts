import { AuthUser } from 'src/shared/auth/auth-user.interface';

export class ResumeTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly user: AuthUser,
  ) {}
}
