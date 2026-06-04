// EFC: Los Hooks de Estado del Servidor: utilizaremos TanStack Query para 
// gestionar el ciclo de vida de los datos, la memoria caché y la sincronización 
// automática de la interfaz. Cuando ejecutes cualquier mutación con éxito, este archivo 
// invalidará los datos viejos para forzar un 
// refresco inmediato en la pantalla sin recargar el navegador.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import { type TaskFilters } from './types';

// Hook reactivo para el listado principal con filtros (RF-02, RF-03)
export const useTasks = (filters: TaskFilters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => api.getTasks(filters),
    placeholderData: (previousData) => previousData, // Evita parpadeos en cambios de página
  });
};

// Hook para el detalle asíncrono de una tarea (RF-04)
export const useTaskDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => api.getTaskById(id!),
    enabled: !!id, // No ejecuta el llamado si no hay un ID seleccionado
  });
};

// Hook centralizado de mutaciones y acciones de negocio
export const useTaskActions = () => {
  const queryClient = useQueryClient();

  // Callback centralizado de éxito para refrescar la caché local de tareas (RNF-03)
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['task'] });
  };

  const createMut = useMutation({ mutationFn: api.createTask, onSuccess: invalidateQueries });
  const assignMut = useMutation({ mutationFn: ({ id, userId }: { id: string; userId: string }) => api.assignTask(id, userId), onSuccess: invalidateQueries });
  const startMut = useMutation({ mutationFn: api.startTask, onSuccess: invalidateQueries });
  const stopMut = useMutation({ mutationFn: api.stopTask, onSuccess: invalidateQueries });
  const resumeMut = useMutation({ mutationFn: api.resumeTask, onSuccess: invalidateQueries });
  const completeMut = useMutation({ mutationFn: api.completeTask, onSuccess: invalidateQueries });
  const priorityMut = useMutation({ mutationFn: ({ id, priority }: { id: string; priority: string }) => api.changeTaskPriority(id, priority), onSuccess: invalidateQueries });
  const commentMut = useMutation({ mutationFn: ({ id, comment }: { id: string; comment: string }) => api.addTaskComment(id, comment), onSuccess: invalidateQueries });

  return {
    createTask: createMut.mutateAsync,
    assignTask: assignMut.mutateAsync,
    startTask: startMut.mutateAsync,
    stopTask: stopMut.mutateAsync,
    resumeTask: resumeMut.mutateAsync,
    completeTask: completeMut.mutateAsync,
    changePriority: priorityMut.mutateAsync,
    addComment: commentMut.mutateAsync,
    isSubmitting:
      createMut.isPending ||
      assignMut.isPending ||
      startMut.isPending ||
      stopMut.isPending ||
      resumeMut.isPending ||
      completeMut.isPending ||
      priorityMut.isPending ||
      commentMut.isPending,
  };
};