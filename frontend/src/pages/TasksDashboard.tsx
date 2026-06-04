import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useTasks, useTaskDetail, useTaskActions } from '../features/tasks/hooks';
import { type TaskFilters, type TaskPriority } from '../features/tasks/types';
import * as rules from '../features/tasks/rules';

export const TasksDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [filters, setFilters] = useState<TaskFilters>({
    page: 1, size: 5, search: '', status: '', priority: '', assignedUserId: ''
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editForm, setEditForm] = useState({ title: '', description: '', dueDate: '', observations: '' });

  const [form, setForm] = useState(() => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return { title: '', description: '', priority: 'MEDIUM' as TaskPriority, observations: '', dueDate: `${anio}-${mes}-${dia}T23:59`, assignedUserId: '' };
  });

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
      await actions.createTask({ ...form, observations: form.observations || undefined, dueDate: form.dueDate || undefined, assignedUserId: form.assignedUserId || undefined, createdByUserId: user.id });
      setIsCreateOpen(false);
      const hoy = new Date();
      const anio = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, '0');
      const dia = String(hoy.getDate()).padStart(2, '0');
      setForm({ title: '', description: '', priority: 'MEDIUM', observations: '', dueDate: `${anio}-${mes}-${dia}T23:59`, assignedUserId: '' });
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      setFormError(axErr.response?.data?.message || 'Error al guardar.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) return;
    
    try {
      await actions.updateTaskGeneral({ id: selectedTaskId, payload: editForm });
      setIsEditOpen(false);
      setSelectedTaskId(null);
    } catch (err: unknown) {
      // 🌟 LEER LOGS REALES: Captura lo que NestJS responde (ej: problemas de longitud o DTO)
      const axiosError = err as { response?: { data?: { message?: string } } };
      const backendMessage = axiosError.response?.data?.message;
      
      console.error('🚨 [PATCH ERROR LOG]:', axiosError.response?.data);
      
      if (backendMessage) {
        alert(`Error del Servidor: ${backendMessage}`);
      } else {
        alert('Error de comunicación con el backend al intentar actualizar.');
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTaskId) return;
    try {
      await actions.addComment({ id: selectedTaskId, comment: newComment.trim() });
      setNewComment('');
    } catch { alert('Error comentario.'); }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8fafc', paddingBottom: '2rem' }}>
      {/* BARRA SUPERIOR */}
      <header style={{ background: '#1e293b', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Task Manager Enterprise</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Usuario: <strong>{user.name}</strong> ({user.role}) | ID: {user.id}</p>
        </div>
        <button onClick={logout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Salir</button>
      </header>

      {/* CUERPO CENTRAL DE LA PANTALLA */}
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Listado Operativo</h2>
            <button onClick={() => setIsCreateOpen(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>+ Crear</button>
          </div>

          {/* Barra Filtros rápidos (RF-03) */}
          <div style={{ display: 'flex', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <input placeholder="Buscar por título..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', flex: 1 }} />
            <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
              <option value="">Cualquier Estado</option>
              <option value="CREATED">CREATED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="STOPPED">STOPPED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          {isLoading && <p style={{ textAlign: 'center' }}>Cargando registros...</p>}
          {isError && <p style={{ color: 'red', textAlign: 'center' }}>Error de conexión al backend</p>}

          {/* Tabla de registros (RF-02) */}
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem' }}>Título</th>
                  <th style={{ padding: '1rem' }}>Estado</th>
                  <th style={{ padding: '1rem' }}>Prioridad</th>
                  <th style={{ padding: '1rem' }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {/* Cuerpo de la tabla con inyección directa de valores */}
              {data?.data && data.data.length > 0 ? (
                data.data.map((task) => (
                  <tr 
                    key={task.id} 
                    onClick={() => { 
                      setSelectedTaskId(task.id); 
                      // 🌟 TRASPASO DIRECTO E INMEDIATO (Evita esperar al backend y soluciona el nulo)
                      setEditForm({
                        title: task.title || '',
                        description: task.description || '',
                        dueDate: task.dueDate ? task.dueDate.substring(0, 16) : '',
                        observations: task.observations || ''
                      });
                      setIsEditOpen(true); 
                    }} 
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: selectedTaskId === task.id ? '#eff6ff' : 'transparent' }}
                  >
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

            {/* Paginación Obligatoria (RF-02) */}
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total: <strong>{data?.total || 0}</strong></span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button disabled={filters.page <= 1} onClick={() => handleFilterChange('page', filters.page - 1)} style={{ padding: '0.3rem 0.6rem', cursor: 'pointer' }}>Ant.</button>
                <span style={{ padding: '0.3rem 0.6rem' }}>Pág. {filters.page}</span>
                <button disabled={!data?.data || data.data.length < filters.size} onClick={() => handleFilterChange('page', filters.page + 1)} style={{ padding: '0.3rem 0.6rem', cursor: 'pointer' }}>Sig.</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL CENTRAL FLOTANTE DE GESTIÓN Y EDICIÓN COMPLETA */}
       {/* 🌟 MODAL CENTRAL FLOTANTE DE GESTIÓN Y EDICIÓN (REPARADO) */}
      {isEditOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>Gestión de Tarea</h3>
              <button type="button" onClick={() => { setIsEditOpen(false); setSelectedTaskId(null); }} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Título *</label>
                <input type="text" required value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Descripción *</label>
                <textarea required rows={3} value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Fecha Compromiso</label>
                  <input type="datetime-local" value={editForm.dueDate} onChange={(e) => setEditForm(p => ({ ...p, dueDate: e.target.value }))} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Observaciones</label>
                  <input type="text" value={editForm.observations} onChange={(e) => setEditForm(p => ({ ...p, observations: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* LÓGICA DE COMENTARIOS HISTORIAL CONDICIONADA AL DTO DEL BACKEND */}
              {taskDetail && (
                <>
                  {/* ACCIONES DEL CICLO DE VIDA */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.4rem' }}>Acciones Operativas</span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {rules.canStart((taskDetail as any).data || taskDetail, user) && <button type="button" onClick={() => actions.startTask(selectedTaskId!)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>🚀 Iniciar</button>}
                      {rules.canStop((taskDetail as any).data || taskDetail, user) && <button type="button" onClick={() => actions.stopTask(selectedTaskId!)} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>⏸ Detener</button>}
                      {rules.canResume((taskDetail as any).data || taskDetail, user) && <button type="button" onClick={() => actions.resumeTask(selectedTaskId!)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>▶ Reanudar</button>}
                      {rules.canComplete((taskDetail as any).data || taskDetail, user) && <button type="button" onClick={() => actions.completeTask(selectedTaskId!)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>✔ Completar</button>}
                    </div>
                  </div>

                  {/* COMENTARIOS */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Comentarios</span>
                    {rules.canComment((taskDetail as any).data || taskDetail, user) && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Escribe un comentario..." style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                        <button type="button" onClick={handleCommentSubmit} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>OK</button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* BOTONES FINALES */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button type="button" onClick={() => { setIsEditOpen(false); setSelectedTaskId(null); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>Cerrar</button>
                <button type="submit" disabled={actions.isSubmitting} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#16a34a', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREACIÓN FLOTANTE (RF-01) */}
      {isCreateOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
            <h3>Nueva Tarea Operativa</h3>
            {formError && <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '0.5rem', marginBottom: '1rem' }}>{formError}</div>}
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" required value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Título * (Min 5)" style={{ width: '100%', padding: '0.5rem' }} />
              <textarea required rows={3} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Descripción * (Min 10)" style={{ width: '100%', padding: '0.5rem' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <select value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as any }))} style={{ padding: '0.5rem' }}>
                  <option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option>
                </select>
                <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))} style={{ padding: '0.45rem' }} />
              </div>
              <input type="text" value={form.observations} onChange={(e) => setForm((prev) => ({ ...prev, observations: e.target.value }))} placeholder="Observaciones" style={{ width: '100%', padding: '0.5rem' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</button>
                <button type="submit" disabled={actions.isSubmitting}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};