// EFC: El Mapeo de Endpoints Este archivo expone funciones asíncronas 
// puras que conectan con cada una de las rutas de tu backend NestJS, 
// tipando tanto las entradas de los filtros como las respuestas paginadas.

import { http } from '../../api/http';
import axios from 'axios';
import { 
  type Task, 
  type TaskFilters, 
  type PaginatedResponse 
} from './types';

export interface KeycloakUser {
  id: string;
  username: string;
  enabled: boolean;
}

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
  // 🌟 Corregido: Se inyecta el ID dentro de la ruta para calzar con /tasks/{id}/start
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

// PATCH /tasks/{id} -> TaskController_update
export const updateTaskGeneral = async (
  id: string,
  payload: {
    title: string;
    description: string;
    dueDate?: string;
    observations?: string;
  }
): Promise<void> => {
  // 🌟 Transformación crítica: Asegura el formato ISO Zulu que le funciona a Postman
  const finalPayload = {
    ...payload,
    dueDate: payload.dueDate ? new Date(payload.dueDate).toISOString() : undefined,
  };

  await http.patch(`/tasks/${id}`, finalPayload);
};

// EFC: Acá encontré que no deja conectar directo a Keyclok, hay que hacerlo a tráves del proxy vite (frontend\vite.config.ts)
// 1. Obtener Token Maestro desde el Realm Master a través del proxy
export const getKeycloakAdminToken = async (): Promise<string> => {
  const params = new URLSearchParams();
  params.append('username', 'admin');     
  params.append('password', 'admin');     
  params.append('grant_type', 'password');
  params.append('client_id', 'admin-cli'); 

  const { data } = await axios.post<{ access_token: string }>(
    '/keycloak-admin/realms/master/protocol/openid-connect/token', // 🔄 Cambiado a ruta relativa
    params,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return data.access_token;
};

// 2. Traer los usuarios del Realm TaskManagement usando la ruta del proxy
export const getKeycloakUsersReal = async (adminToken: string): Promise<KeycloakUser[]> => {
  const { data } = await axios.get<KeycloakUser[]>(
    '/keycloak-admin/admin/realms/TaskManagement/users', // 🔄 Cambiado a ruta relativa
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  return data;
};