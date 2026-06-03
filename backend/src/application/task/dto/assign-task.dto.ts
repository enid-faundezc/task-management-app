import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignTaskDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;
}
