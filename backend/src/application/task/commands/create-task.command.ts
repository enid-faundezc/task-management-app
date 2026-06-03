import { CreateTaskDto } from '../dto/create-task.dto';

// EFC: El comando representa: Intención de negocio, no implementación.
// Es un objeto que encapsula toda la información necesaria para realizar
// una acción específica, en este caso, crear una tarea. El comando se utiliza para
// separar la lógica de negocio de la lógica de aplicación, permitiendo una mayor
// flexibilidad y mantenibilidad del código.
export class CreateTaskCommand {
  constructor(public readonly dto: CreateTaskDto) {}
}
