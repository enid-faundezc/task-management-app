import { TaskResponseDto } from './task-response.dto';

export class PaginatedTaskResponseDto {
  data!: TaskResponseDto[];

  total!: number;

  page!: number;

  size!: number;
}
