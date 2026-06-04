// EFC: El Mapeo de Endpoints Este archivo expone funciones asíncronas 
// puras que conectan con cada una de las rutas de tu backend NestJS, 
// tipando tanto las entradas de los filtros como las respuestas paginadas.

import { http } from '../../api/http';
import { 
  type Task, 
  type TaskFilters, 
  type PaginatedResponse 
} from './types';

// GET /tasks -> TaskController_findAll (RF-02, RF-03)
export const getTasks = async (params: TaskFilters): Promise<PaginatedResponse<Task>> => {
  const cleanedParams = Object.entries(params).reduce<Record<string, string | number>>((acc, [key, value]) => {
    if (value !== '' && value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});

  // Accedemos a .data.data para saltar el DTO global de respuesta
  const response = await http.get<{ success: boolean; message: string; data: PaginatedResponse<Task> }>('/tasks', { params: cleanedParams });
  return response.data.data;
};

// GET /tasks/{id} -> TaskController_findById (RF-04)
export const getTaskById = async (id: string): Promise<Task> => {
  const { data } = await http.get<Task>(`/tasks/${id}`);
  return data;
};

// POST /tasks -> TaskController_create (RF-01)
export const createTask = async (payload: {
  title: string;
  description: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  observations?: string;
  dueDate?: string;
  assignedUserId?: string;
  createdByUserId: string; // Requerido estrictamente por el DTO
}): Promise<Task> => {
  const { data } = await http.post<Task>('/tasks', payload);
  return data;
};

// POST /tasks/{id}/assign -> TaskController_assign (RF-05)
export const assignTask = async (id: string, userId: string): Promise<void> => {
  await http.post(`/tasks/${id}/assign`, { userId });
};

// POST /tasks/{id}/start -> TaskController_start (RF-06)
export const startTask = async (id: string): Promise<void> => {
  await http.post(`/tasks/${id}/start`);
};

// POST /tasks/{id}/stop -> TaskController_stop (RF-07)
export const stopTask = async (id: string): Promise<void> => {
  await http.post(`/tasks/${id}/stop`);
};

// POST /tasks/{id}/resume -> TaskController_resume (RF-08)
export const resumeTask = async (id: string): Promise<void> => {
  await http.post(`/tasks/${id}/resume`);
};

// POST /tasks/{id}/complete -> TaskController_complete (RF-09)
export const completeTask = async (id: string): Promise<void> => {
  await http.post(`/tasks/${id}/complete`);
};

// PATCH /tasks/{id}/priority -> TaskController_changePriority (RF-10)
export const changeTaskPriority = async (id: string, priority: string): Promise<void> => {
  // Ajustado según el esquema vacío del OpenAPI que asume la propiedad directa o vacía
  await http.patch(`/tasks/${id}/priority`, { priority });
};

// POST /tasks/{id}/comments -> TaskController_addComment (RF-11)
export const addTaskComment = async (id: string, comment: string): Promise<void> => {
  // Envía el body con la propiedad "comment" exigida por AddTaskCommentDto
  await http.post(`/tasks/${id}/comments`, { comment });
};