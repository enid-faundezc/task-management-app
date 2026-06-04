import { Task } from '../entities/task.entity';
import { TaskFilters } from './task-filters';
import { PaginatedResult } from '../../../shared/pagination/paginated-result';
import { TaskFiltersDto } from 'src/application/task/dto/task-filters.dto';

// EFC: Este repositorio define las operaciones que se pueden realizar con las tareas
// en la base de datos. Las operaciones incluyen:
// - save: para guardar una nueva tarea en la base de datos.
// - update: para actualizar una tarea existente en la base de datos.
// - findById: para encontrar una tarea por su ID.
// - findAll: para encontrar todas las tareas que cumplen con ciertos filtros.
// ¿Por qué abstract class y no interface?
// En TypeScript, NestJS trabaja mucho mejor con DI usando clases abstractas como token
// EFC: La implementación está en: /src/infrastructure/repositories/task.repository.impl.ts
export abstract class TaskRepository {
  abstract save(task: Task): Promise<void>;

  abstract update(id: string, task: Task): Promise<void>;

  abstract findById(id: string): Promise<Task | null>;

  abstract findAll(filters: TaskFilters): Promise<PaginatedResult<Task>>;

  abstract findOrFail(id: string): Promise<Task>;

  abstract findVisibleToUser(
    userId: string,
    filters: TaskFiltersDto,
  ): Promise<PaginatedResult<Task>>;
}
