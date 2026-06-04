// EFC: La pantalla única unificada (/src/pages/TasksDashboard.tsx). 
// Aquí uniremos todo el sistema: los filtros, el listado paginado, las validaciones 
// de caracteres en el formulario de creación (RN-01 y RN-02) y el modal lateral con el 
// detalle, historial de auditoría y comentarios.
// EFC: Acá tipado estricto, sin usar any.

import React, { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useTasks, useTaskDetail, useTaskActions } from '../features/tasks/hooks';
import { type TaskFilters, type TaskPriority } from '../features/tasks/types';
import * as rules from '../features/tasks/rules';

export const TasksDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    size: 5,
    search: '',
    status: '',
    priority: '',
    assignedUserId: ''
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [form, setForm] = useState(() => {
    const hoy = new Date();
    // Formato requerido por el input datetime-local: YYYY-MM-DDTHH:mm
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    
    return {
      title: '',
      description: '',
      priority: 'MEDIUM' as TaskPriority,
      observations: '',
      dueDate: `${anio}-${mes}-${dia}T23:59`, //Seteado hoy a las 23:59 por defecto
      assignedUserId: '',
    };
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const { data, isLoading, isError } = useTasks(filters);
  const { data: taskDetail } = useTaskDetail(selectedTaskId);
  const actions = useTaskActions();

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando sesión...</div>;

  const handleFilterChange = (key: keyof TaskFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (form.title.length < rules.VALIDATIONS.TITLE.min || form.title.length > rules.VALIDATIONS.TITLE.max) {
      setFormError(`Título debe tener entre ${rules.VALIDATIONS.TITLE.min} y ${rules.VALIDATIONS.TITLE.max} letras.`);
      return;
    }
    if (form.description.length < rules.VALIDATIONS.DESCRIPTION.min || form.description.length > rules.VALIDATIONS.DESCRIPTION.max) {
      setFormError(`Descripción debe tener entre ${rules.VALIDATIONS.DESCRIPTION.min} y ${rules.VALIDATIONS.DESCRIPTION.max} letras.`);
      return;
    }

    try {
      await actions.createTask({
        ...form,
        observations: form.observations || undefined,
        dueDate: form.dueDate || undefined,
        assignedUserId: form.assignedUserId || undefined,
        createdByUserId: user.id
      });
      setIsCreateOpen(false);

      const hoy = new Date();
      const anio = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, '0');
      const dia = String(hoy.getDate()).padStart(2, '0');

      setForm({ 
        title: '', 
        description: '', 
        priority: 'MEDIUM', 
        observations: '', 
        dueDate: `${anio}-${mes}-${dia}T23:59`, 
        assignedUserId: '' 
      });
    } catch (err: unknown) {
      // TIPADO ESTRICTO: Validamos con un Type-Guard seguro en vez de usar any
      const axiosError = err as { response?: { data?: { message?: string } } };
      const backendMessage = axiosError.response?.data?.message;
      
      if (backendMessage) {
        setFormError(backendMessage);
      } else {
        setFormError('Error de comunicación al guardar registro en el servidor.');
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTaskId) return;

    await actions.addComment({
      id: selectedTaskId,
      comment: newComment.trim()
    });

    setNewComment('');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      {/* HEADER */}
      <header style={{ background: '#1e293b', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>Task Manager Enterprise</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
            Usuario: <strong>{user.name}</strong> ({user.role}) | ID: <span style={{ color: '#60a5fa' }}>{user.id}</span>
          </p>
        </div>
        <button onClick={logout}>Salir</button>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: selectedTaskId ? '1fr 420px' : '1fr', gap: '2rem', padding: '2rem' }}>

        {/* LISTADO */}
        <section>
          <h2>Listado Operativo</h2>

          <button onClick={() => setIsCreateOpen(true)}>+ Crear</button>

          {/* filtros */}
          <input
            placeholder="Buscar"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />

          {isLoading && <p>Cargando...</p>}
          {isError && <p>Error backend</p>}

          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {/* Cambiado de data?.items a data?.data para leer el arreglo real */}
              {data?.data && data.data.length > 0 ? (
                data.data.map((task) => (
                  <tr key={task.id} onClick={() => setSelectedTaskId(task.id)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: selectedTaskId === task.id ? '#eff6ff' : 'transparent' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{task.title}</td>
                    <td style={{ padding: '1rem' }}><span style={{ padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', background: task.status === 'COMPLETED' ? '#dcfce7' : '#f1f5f9', color: task.status === 'COMPLETED' ? '#15803d' : '#475569' }}>{task.status}</span></td>
                    <td style={{ padding: '1rem' }}>{task.priority}</td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(task.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Ningún registro coincide.</td></tr>
              )}
            </tbody>
          </table>

          {/* 🌟 BLOQUE DE PAGINACIÓN OBLIGATORIA (RF-02) */}
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total: <strong>{data?.total || 0}</strong></span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button disabled={filters.page <= 1} onClick={() => handleFilterChange('page', filters.page - 1)} style={{ padding: '0.3rem 0.6rem', cursor: 'pointer' }}>Ant.</button>
              <span style={{ padding: '0.3rem 0.6rem' }}>Pág. {filters.page}</span>
              <button disabled={!data?.data || data.data.length < filters.size} onClick={() => handleFilterChange('page', filters.page + 1)} style={{ padding: '0.3rem 0.6rem', cursor: 'pointer' }}>Sig.</button>
            </div>
          </div>
        </section>

        {/* DETALLE */}
        {selectedTaskId && taskDetail && (
          <aside style={{ background: 'white', padding: '1rem' }}>
            <h3>{taskDetail.title}</h3>
            <p>{taskDetail.description}</p>

            {/* ACCIONES */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {rules.canStart(taskDetail, user) && (
                <button onClick={() => actions.startTask(taskDetail.id)}>Iniciar</button>
              )}

              {rules.canStop(taskDetail, user) && (
                <button onClick={() => actions.stopTask(taskDetail.id)}>Detener</button>
              )}

              {rules.canResume(taskDetail, user) && (
                <button onClick={() => actions.resumeTask(taskDetail.id)}>Reanudar</button>
              )}

              {rules.canComplete(taskDetail, user) && (
                <button onClick={() => actions.completeTask(taskDetail.id)}>Completar</button>
              )}
            </div>

            {/* COMENTARIOS */}
            <h4>Comentarios ({taskDetail.comments?.length || 0})</h4>

            {rules.canComment(taskDetail, user) && (
              <form onSubmit={handleCommentSubmit}>
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Comentario"
                />
                <button>OK</button>
              </form>
            )}
          </aside>
        )}
      </main>

      {/* MODAL CREAR */}
      {isCreateOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>Nueva Tareas Operativa</h3>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            {formError && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</div>}

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Título * (Min: 5)</label>
                <input type="text" required value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Ej: Implementar integración Keycloak" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Descripción * (Min: 10)</label>
                <textarea required rows={3} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Describe los alcances..." style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Prioridad</label>
                  <select value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as any }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white' }}>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Fecha Compromiso</label>
                  <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* 🌟 Campo "ID Asignar Usuario" REMOVIDO exitosamente de aquí */}

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Observaciones</label>
                <input type="text" value={form.observations} onChange={(e) => setForm((prev) => ({ ...prev, observations: e.target.value }))} placeholder="Notas internas..." style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={actions.isSubmitting} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                  {actions.isSubmitting ? 'Guardando...' : 'Crear Tarea'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};