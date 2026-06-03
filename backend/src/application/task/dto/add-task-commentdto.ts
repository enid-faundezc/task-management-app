import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class AddTaskCommentDto {

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  comment!: string;
}
