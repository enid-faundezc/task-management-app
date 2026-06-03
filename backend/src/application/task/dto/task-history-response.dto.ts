export class TaskHistoryResponseDto {
  id!: string;

  eventType!: string;

  previousValue!: string | null;

  newValue!: string | null;

  comment!: string | null;

  userId!: string | null;

  createdAt!: Date;
}
