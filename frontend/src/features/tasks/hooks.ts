import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import { type TaskFilters } from './types';

// Hook reactivo para el listado principal con filtros (RF-02, RF-03)
export const useTasks = (filters: TaskFilters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => api.getTasks(filters),
    placeholderData: (previousData) => previousData,
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

// Hook para obtener el historial de cambios de una tarea específica con TanStack Query
export const useTaskHistory = (id: string | null) => {
  return useQuery({
    queryKey: ['taskHistory', id],
    queryFn: () => api.getTaskHistory(id!),
    enabled: !!id, // Evita ejecutar la consulta si el ID es nulo
    staleTime: 0,  // Forzamos a que traiga datos frescos cada vez que se consulte el historial
  });
};

// Hook centralizado de mutaciones y acciones de negocio
export const useTaskActions = () => {
  const queryClient = useQueryClient();

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
  
  // 🌟 NUEVA MUTACIÓN: Conecta la edición general con TanStack Query
  const updateGeneralMut = useMutation({ 
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateTaskGeneral(id, payload), 
    onSuccess: invalidateQueries 
  });

  return {
    createTask: createMut.mutateAsync,
    assignTask: assignMut.mutateAsync,
    startTask: startMut.mutateAsync,
    stopTask: stopMut.mutateAsync,
    resumeTask: resumeMut.mutateAsync,
    completeTask: completeMut.mutateAsync,
    changePriority: priorityMut.mutateAsync,
    addComment: commentMut.mutateAsync,
    updateTaskGeneral: updateGeneralMut.mutateAsync, // 🌟 Retorno oficial requerido por el Dashboard
    isSubmitting:
      createMut.isPending ||
      assignMut.isPending ||
      startMut.isPending ||
      stopMut.isPending ||
      resumeMut.isPending ||
      completeMut.isPending ||
      priorityMut.isPending ||
      commentMut.isPending ||
      updateGeneralMut.isPending,
  };
};

export const useKeycloakUsers = (isEnabled: boolean) => {
  return useQuery({
    queryKey: ['keycloakUsersReal'],
    queryFn: async () => {
      const token = await api.getKeycloakAdminToken(); // Pide token a master
      return api.getKeycloakUsersReal(token);          // Trae usuarios de TaskManagement
    },
    enabled: isEnabled,
    staleTime: 300000, // Almacena en caché por 5 minutos para rendimiento óptimo
  });
};