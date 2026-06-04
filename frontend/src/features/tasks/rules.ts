import { type Task, type User} from './types'; // EFC: Tipado estricto
// EFC: Las reglas de negocio.
/**
 * RN-01 y RN-02: Validaciones de longitud para la creación de tareas
 */
export const VALIDATIONS = {
  TITLE: { min: 5, max: 200, required: true },
  DESCRIPTION: { min: 10, max: 500, required: true },
  OBSERVATIONS: { max: 1000 }
};

/**
 * RN-07 y RN-09: Control de Asignación / Reasignación
 * Solo tareas en estado CREATED o ASSIGNED pueden asignarse.
 * Una tarea COMPLETED no puede asignarse. Solo permitido para Administradores.
 */
export const canAssign = (task: Task, user: User): boolean => {
  if (user.role !== 'ADMIN') return false;
  if (task.status === 'COMPLETED') return false;
  return task.status === 'CREATED' || task.status === 'ASSIGNED';
};

/**
 * RN-10: Iniciar Tarea (Cambiar a IN_PROGRESS)
 * Solo tareas en estado ASSIGNED pueden iniciarse.
 * Debe estar asignada al usuario actual (o ser Administrador).
 */
export const canStart = (task: Task, user: User): boolean => {
  const isOwner = task.assignedUserId === user.id || user.role === 'ADMIN';
  return task.status === 'ASSIGNED' && isOwner;
};

/**
 * RN-11: Detener Tarea (Cambiar a STOPPED)
 * Solo tareas en estado IN_PROGRESS pueden detenerse.
 */
export const canStop = (task: Task, user: User): boolean => {
  const isOwner = task.assignedUserId === user.id || user.role === 'ADMIN';
  return task.status === 'IN_PROGRESS' && isOwner;
};

/**
 * RN-12: Reanudar Tarea (Cambiar a IN_PROGRESS)
 * Solo tareas en estado STOPPED pueden reanudarse.
 */
export const canResume = (task: Task, user: User): boolean => {
  const isOwner = task.assignedUserId === user.id || user.role === 'ADMIN';
  return task.status === 'STOPPED' && isOwner;
};

/**
 * RN-13 y RN-15: Completar Tarea (Marcar como COMPLETED)
 * Solo tareas en estado IN_PROGRESS pueden completarse.
 * COMPLETED es un estado terminal.
 */
export const canComplete = (task: Task, user: User): boolean => {
  const isOwner = task.assignedUserId === user.id || user.role === 'ADMIN';
  return task.status === 'IN_PROGRESS' && isOwner;
};

/**
 * RN-16: Cambiar Prioridad
 * No se permite cambiar la prioridad si la tarea ya está COMPLETED.
 * Es una acción exclusiva del Administrador según las reglas del flujo.
 */
export const canChangePriority = (task: Task, user: User): boolean => {
  if (user.role !== 'ADMIN') return false;
  return task.status !== 'COMPLETED';
};

/**
 * RF-11 (Regla implícita de participación): Agregar Comentario
 * Permite agregar comentarios si el usuario es ADMIN, o si participa (es creador o asignado).
 */
export const canComment = (task: Task, user: User): boolean => {
  if (user.role === 'ADMIN') return true;
  return task.createdByUserId === user.id || task.assignedUserId === user.id;
};

/**
 * Regla de visualización de botones de modificación (RF-01 / Modificar)
 * El usuario común solo modifica tareas que él mismo creó. El Admin modifica todo.
 */
export const canModifyTaskGeneral = (task: Task, user: User): boolean => {
  if (user.role === 'ADMIN') return true;
  return task.createdByUserId === user.id;
};