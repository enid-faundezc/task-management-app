import {
  IsString,
  IsOptional,
  MaxLength,
  IsDateString,
  MinLength,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../../../domain/task/enums/task-priority.enum';

// EFC: Esta clase define el DTO para la creación de tareas.
// Incluye validaciones y documentación para cada campo, asegurando
// que los datos recibidos sean correctos y estén bien documentados en la API.
// El campo 'status' no se incluye aquí porque es una regla de negocio
// que se maneja internamente en el caso de uso de creación de tareas,
// y no debe ser proporcionado por el cliente de la API.

export class CreateTaskDto {
  // EFC: El título es obligatorio
  @ApiProperty({
    example: 'Implementar integración Keycloak',
    minLength: 5,
    maxLength: 200,
    description: 'Título de la tarea',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title!: string;

  // EFC: La descripción es obligatoria
  @ApiProperty({
    example:
      'Implementar autenticación OIDC utilizando Keycloak y validación JWT.',
    minLength: 10,
    maxLength: 500,
    description: 'Descripción detallada de la tarea',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description!: string;

  // EFC: La prioridad es opcional, si no se proporciona se asignará MEDIUM por defecto en el dominio.
  @ApiPropertyOptional({
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
    description: 'Prioridad de la tarea',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  // EFC: Las observaciones son opcionales
  @ApiPropertyOptional({
    example: 'Pendiente validación con arquitectura.',
    maxLength: 1000,
    description: 'Observaciones adicionales',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observations?: string;

  // EFC: La fecha de entrega es opcional, si se proporciona debe ser una fecha válida en formato ISO 8601.
  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59Z',
    description: 'Fecha comprometida de entrega',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  // EFC: El ID del usuario asignado es opcional, si se proporciona debe ser una cadena de texto.
  @ApiPropertyOptional({
    example: '3f50c8f8-b4e5-44b2-a4c4-c4d58d7a1234',
    description: 'Identificador del usuario asignado',
  })
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  // EFC: El ID del usuario que crea la tarea es obligatorio, se necesita para registrar el evento de creación en el historial.
  @ApiProperty()
  @IsUUID()
  createdByUserId!: string;
}
