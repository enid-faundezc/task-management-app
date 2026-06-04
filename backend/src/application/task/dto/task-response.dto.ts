export class TaskResponseDto {
  id!: string;

  title!: string;

  description!: string;

  priority!: string;

  status!: string;

  assignedUserId?: string | null;

  createdByUserId!: string;

  observations?: string | null;

  dueDate?: Date | null;

  createdAt!: Date;

  updatedAt!: Date;
}
