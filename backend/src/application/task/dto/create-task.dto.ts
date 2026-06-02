import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  assignedUserId?: string;
}
