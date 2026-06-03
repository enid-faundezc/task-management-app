import { Task } from '../entities/task.entity';
import { TaskFilters } from './task-filters';
import { PaginatedResult } from '../../../shared/pagination/paginated-result';

// EFC: Este repositorio define las operaciones que se pueden realizar con las tareas
// en la base de datos. Las operaciones incluyen:
// - save: para guardar una nueva tarea en la base de datos.
// - update: para actualizar una tarea existente en la base de datos.
// - findById: para encontrar una tarea por su ID.
// - findAll: para encontrar todas las tareas que cumplen con ciertos filtros.
// ¿Por qué abstract class y no interface?
// En TypeScript, NestJS trabaja mucho mejor con DI usando clases abstractas como token

export abstract class TaskRepository {
  abstract save(task: Task): Promise<void>;

  abstract update(task: Task): Promise<void>;

  abstract findById(id: string): Promise<Task | null>;

  abstract findAll(filters: TaskFilters): Promise<PaginatedResult<Task>>;
}
