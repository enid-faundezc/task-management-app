import { AuthUser } from 'src/shared/auth/auth-user.interface';

export class StopTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly user: AuthUser,
  ) {}
}
