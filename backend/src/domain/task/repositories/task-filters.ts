import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

// EFC: este objeto define como se filtraran las tareas
// en la base de datos, se pueden filtrar por estado, prioridad,
// usuario asignado, busqueda por texto y paginacion.

export interface TaskFilters {
  status?: TaskStatus;

  priority?: TaskPriority;

  assignedUserId?: string;

  search?: string;

  page?: number;

  size?: number;
}
