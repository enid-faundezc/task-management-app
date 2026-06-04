import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useTaskDetail, useTaskActions } from '../features/tasks/hooks';
import * as rules from '../features/tasks/rules';

interface AsideProps {
  id: string;
  onClose: () => void;
}

export const TaskAsideDetail = ({ id, onClose }: AsideProps) => {
  const user = useAuthStore((state) => state.user);
  const { data: taskDetail, isLoading } = useTaskDetail(id);
  const actions = useTaskActions();

  // Control del Modal Central de Edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editForm, setEditForm] = useState({ title: '', description: '', dueDate: '', observations: '' });

  // Sincroniza los textos cuando se abre el modo edición
  useEffect(() => {
    if (taskDetail) {
      setEditForm({
        title: taskDetail.title || '',
        description: taskDetail.description || '',
        dueDate: taskDetail.dueDate ? taskDetail.dueDate.substring(0, 16) : '',
        observations: taskDetail.observations || ''
      });
    }
  }, [taskDetail, isEditModalOpen]);

  if (isLoading) return <aside style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}><p>Cargando detalle...</p></aside>;
  if (!taskDetail || !user) return null;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await actions.addComment({ id, comment: newComment.trim() });
      setNewComment('');
    } catch {
      alert('Error al guardar comentario.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm.title.length < 5 || editForm.description.length < 10) {
      alert('Título mínimo 5 caracteres, Descripción mínimo 10.');
      return;
    }
    try {
      await actions.updateTaskGeneral(id, editForm);
      setIsEditModalOpen(false); // Cierra el modal al guardar con éxito
    } catch {
      alert('Error al actualizar la tarea.');
    }
  };

  return (
    <aside style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', height: 'fit-content', boxSizing: 'border-box' }}>
      
      {/* ENCABEZADO PANEL LATERAL LECTURA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Detalle de Tarea</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {rules.canModifyTaskGeneral(taskDetail, user) && (
            <button onClick={() => setIsEditModalOpen(true)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>✏️ Editar</button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.2rem' }}>✕</button>
        </div>
      </div>

      {/* VISTA DE LECTURA LIMPIA */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.05rem' }}>{taskDetail.title}</h4>
        <p style={{ fontSize: '0.85rem', color: '#475569', background: '#f8fafc', padding: '0.5rem', borderRadius: '4px', margin: 0, border: '1px solid #f1f5f9' }}>{taskDetail.description}</p>
        {taskDetail.observations && <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', fontStyle: 'italic' }}><strong>Obs:</strong> {taskDetail.observations}</p>}
      </div>

      {/* BOTONES DE CAMBIO DE ESTADO */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
        {rules.canStart(taskDetail, user) && <button onClick={() => actions.startTask(id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>🚀 Iniciar</button>}
        {rules.canStop(taskDetail, user) && <button onClick={() => actions.stopTask(id)} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>⏸ Detener</button>}
        {rules.canResume(taskDetail, user) && <button onClick={() => actions.resumeTask(id)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>▶ Reanudar</button>}
        {rules.canComplete(taskDetail, user) && <button onClick={() => actions.completeTask(id)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>✔ Completar</button>}
      </div>

      {/* SECCIÓN COMENTARIOS */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#475569', fontWeight: 'bold' }}>Comentarios ({taskDetail.comments?.length || 0})</h4>
        {rules.canComment(taskDetail, user) && (
          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Comentario..." style={{ flex: 1, padding: '0.3rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            <button style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>OK</button>
          </form>
        )}
      </div>

      {/* MODAL CENTRAL DE EDICIÓN (ESTÉTICA IDÉNTICA AL DE CREAR) */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>Editar Tarea Operativa</h3>
              <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Título * (Min: 5)</label>
                <input type="text" required value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Descripción * (Min: 10)</label>
                <textarea required rows={3} value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Fecha Compromiso</label>
                <input type="datetime-local" value={editForm.dueDate} onChange={(e) => setEditForm(p => ({ ...p, dueDate: e.target.value }))} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Observaciones</label>
                <input type="text" value={editForm.observations} onChange={(e) => setEditForm(p => ({ ...p, observations: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={actions.isSubmitting} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#16a34a', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                  {actions.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </aside>
  );
};