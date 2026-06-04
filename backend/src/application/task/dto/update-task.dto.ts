import { IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Date) // <-- AGREGA ESTO para convertir el string de Postman a un objeto Date real
  @IsDate() // <-- Cambia IsDateString por IsDate
  dueDate?: Date;

  @IsOptional()
  @IsString()
  observations?: string;
}
