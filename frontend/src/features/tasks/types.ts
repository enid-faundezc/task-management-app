// EFC: Tipos estrictos basados en las máquinas de estado del requerimiento
export type TaskStatus = 'CREATED' | 'ASSIGNED' | 'IN_PROGRESS' | 'STOPPED' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type HistoryEventType = 'CREATED' | 'ASSIGNED' | 'REASSIGNED' | 'STATUS_CHANGED' | 'PRIORITY_CHANGED' | 'COMMENT_ADDED';

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  comment: string; // Coincide con AddTaskCommentDto
  createdAt: string;
}

export interface HistoryEvent {
  id: string;
  eventType: HistoryEventType;
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
}

// Interfaz Core de la Tarea (RF-01 a RF-04)
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignedUserId: string | null;
  observations?: string;
  createdByUserId: string;
  createdAt: string;
  comments: Comment[];
  history: HistoryEvent[];
}

// Parámetros de consulta exactos del TaskController_findAll
export interface TaskFilters {
  page: number;
  size: number;
  status?: string;
  priority?: string;
  assignedUserId?: string;
  search?: string; // Filtro por texto de título
}

// Estructura de respuesta paginada del backend (RF-02)
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

// Estructura de respuesta paginada REAL de tu backend (RF-02)
export interface PaginatedResponse<T> {
  data: T[]; // Cambiado de 'items' a 'data' para coincidir con tu JSON
  total: number;
  page: number;
  size: number;
}