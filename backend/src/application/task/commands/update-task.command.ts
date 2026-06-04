import { AuthUser } from 'src/shared/auth/auth-user.interface';
import { UpdateTaskDto } from '../dto/update-task.dto';

export class UpdateTaskCommand {
  constructor(
    public readonly taskId: string,
    public readonly dto: UpdateTaskDto,
    public readonly user: AuthUser,
  ) {}
}
