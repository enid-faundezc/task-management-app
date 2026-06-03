import { TaskHistory } from 'src/domain/task/entities/task-history.entity';
import { TaskHistoryResponseDto } from '../dto/task-history-response.dto';

export class TaskHistoryResponseMapper {
  static toDto(history: TaskHistory): TaskHistoryResponseDto {
    return {
      id: history.id,
      eventType: history.eventType,
      previousValue: history.previousValue,
      newValue: history.newValue,
      comment: history.comment,
      userId: history.userId,
      createdAt: history.createdAt,
    };
  }
}
