import { AuthUser } from 'src/shared/auth/auth-user.interface';

export class GetTaskByIdQuery {
  constructor(
    public readonly taskId: string,
    public readonly user: AuthUser,
  ) {}
}
