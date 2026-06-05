import React, { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
//EFC: Se llama al hook para llamar al endpoint
import { useTasks, useTaskDetail, useTaskActions, useKeycloakUsers, useTaskHistory  } from '../features/tasks/hooks'; 
import { type TaskFilters, type TaskPriority } from '../features/tasks/types';
import * as rules from '../features/tasks/rules';
import { formatGlobalDate } from '../utils/date'; // EFC: Para formatear fechas 

// EFC:  Diccionario Global para traducir estados a textos amables (RF-02, RF-04)
const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Creado',
  ASSIGNED: 'Asignado',
  IN_PROGRESS: 'En progreso', 
  STOPPED: 'Detenido',
  COMPLETED: 'Completado'
};

// Diccionario para traducir prioridades a textos amables
const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica'
};

// Diccionario de colores (Fondo y Texto) usando Tailwind/Hex estándar muy legibles
const PRIORITY_STYLES: Record<TaskPriority, { bg: string; color: string }> = {
  LOW: { bg: '#f1f5f9', color: '#475569' },       // Gris
  MEDIUM: { bg: '#fef9c3', color: '#854d0e' },    // Amarillo oscuro
  HIGH: { bg: '#ffedd5', color: '#c2410c' },      // Naranja
  CRITICAL: { bg: '#fee2e2', color: '#b91c1c' }   // Rojo
};

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
  // const [newComment, setNewComment] = useState(''); // EFC: Se eliminan momentáneamente
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    dueDate: string;
    observations: string;
    status?: string; // EFC Permitimos el estado opcional para control de solo lectura
  }>({ title: '', description: '', dueDate: '', observations: '', status: '' });
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const [form, setForm] = useState(() => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return { title: '', description: '', priority: 'MEDIUM' as TaskPriority, observations: '', dueDate: `${anio}-${mes}-${dia}T23:59`, assignedUserId: '' };
  });

  const { data, isLoading, isError } = useTasks(filters);
  const { data: taskDetail } = useTaskDetail(selectedTaskId);

  const { data: historyData, isPending: isHistoryLoading } = useTaskHistory(
    isHistoryOpen ? selectedTaskId : null
  );

  // 🌟 Variable de control: Bloquea los cambios si está COMPLETED y el operador es un USER
  

  const actions = useTaskActions();

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');

  // EFC: Lista  de usuarios de Keycloak local para alimentar el Combo/Select
  const { data: keycloakUsersReal, isLoading: isLoadingUsers } = useKeycloakUsers(user?.role === 'ADMIN');

  // EFC: Ahora, la ista de usuarios la definimos con usememo para retulizar su contenido.
  // este mapa está optimizado para indexar los nombres por ID
  const usersMap = React.useMemo(() => {
  const map: Record<string, string> = {};

  // Si no es admin o aún está cargando, devolvemos el mapa vacío
  if (!keycloakUsersReal) return map; 
    keycloakUsersReal.forEach((u) => {
      // EFC: Por ahora simple nada más
      // const fullName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
      // map[u.id] = fullName || u.username || 'Usuario sin nombre';
      map[u.id] = u.username || 'Usuario sin nombre';
    });
    return map;
  }, [keycloakUsersReal]);

   // Controlador oficial para ejecutar el POST /tasks/{id}/assign (RF-05, RN-07)
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !selectedAssigneeId) {
      alert('Por favor, selecciona un usuario.');
      return;
    }

    try {
      // Gatillamos el hook que ejecuta el POST con la estructura exacta: { userId }
      await actions.assignTask({ id: selectedTaskId, userId: selectedAssigneeId });
      // alert('Tarea asignada exitosamente. El estado ha cambiado a ASSIGNED.');
      setIsAssignOpen(false);
      setSelectedTaskId(null);
      setSelectedAssigneeId('');
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      setFormError(axErr.response?.data?.message || 'Error al guardar.');
    }
  };
  
  const isTaskReadOnly = user?.role === 'USER' && (
    (editForm as any).status === 'COMPLETED' || 
    (taskDetail as any)?.data?.status === 'COMPLETED' || 
    (taskDetail as any)?.status === 'COMPLETED'
  );

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando sesión...</div>;

  const handleFilterChange = (key: keyof TaskFilters, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // 🌟 Si cambias la página, mantén el valor. Si cambias otro filtro, vuelve a la 1.
      page: key === 'page' ? (value as number) : 1
    }));
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
      // 🌟 EXTRACCIÓN LIMPIA: Desestructuramos el objeto para separar "status"
      // y quedarnos únicamente con las 4 propiedades que el DTO del backend tolera.
      const { status, ...cleanPayload } = editForm;

      // Enviamos hacia tu hook únicamente el payload sanitizado
      await actions.updateTaskGeneral({ id: selectedTaskId, payload: cleanPayload });
      
      setIsEditOpen(false);
      setSelectedTaskId(null);
    } catch (err: unknown) {
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

  // EFC: No se utilizará en la versión 1.0
  // const handleCommentSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!newComment.trim() || !selectedTaskId) return;
  //   try {
  //     await actions.addComment({ id: selectedTaskId, comment: newComment.trim() });
  //     setNewComment('');
  //   } catch { alert('Error comentario.'); }
  // };

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f8fafc', paddingBottom: '2rem' }}>
      {/* BARRA SUPERIOR */}
      <header style={{ background: '#1e293b', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Administrador de Tareas</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Usuario: <strong>{user.name}</strong> ({user.role}) | ID: {user.id}</p>
        </div>
        <button onClick={logout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Salir</button>
      </header>

      {/* CUERPO CENTRAL DE LA PANTALLA */}
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Listado de Tareas</h2>
            {/* ADMIN no puede crear tareas */}
            {user?.role !== 'ADMIN' && (
              <button 
                onClick={() => setIsCreateOpen(true)} 
                style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
              >
                + Crear
              </button>
            )}
          </div>

          {/* Barra Filtros rápidos (RF-03) */}
          <div style={{ display: 'flex', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <input placeholder="Buscar por título..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', flex: 1 }} />
            
            <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white' }}>
              <option value="">Cualquier Estado</option>
              {/* 🌟 Mantenemos el value oficial en mayúsculas pero usamos etiquetas amables en español */}
              <option value="CREATED">Creado</option>
              <option value="ASSIGNED">Asignado</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="STOPPED">Detenido</option>
              <option value="COMPLETED">Completado</option>
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
                  {user?.role === 'ADMIN' && (
                    <>
                      <th style={{ padding: '1rem' }}>Creado Por</th>
                      <th style={{ padding: '1rem' }}>Asignado A</th>
                    </>
                  )}
                  {/* 🌟 NUEVA COLUMNA DE CONTROL */}
                  <th style={{ padding: '1rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data?.data && data.data.length > 0 ? (
                  data.data.map((task: any) => (
                      <tr 
                        key={task.id} 
                        style={{ borderBottom: '1px solid #f1f5f9', background: selectedTaskId === task.id ? '#eff6ff' : 'transparent' }}
                      >
                      {/* Titulo Tarea */}
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{task.title}</td>
                      {/* Estado Tarea */}
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '12px', 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold', 
                          // 🎨 Colores dinámicos: Verde para Completado, Azul para En progreso, Gris para el resto
                          background: task.status === 'COMPLETED' ? '#dcfce7' : task.status === 'IN_PROGRESS' ? '#dbeafe' : '#f1f5f9', 
                          color: task.status === 'COMPLETED' ? '#15803d' : task.status === 'IN_PROGRESS' ? '#1d4ed8' : '#475569' 
                        }}>
                          {/* Muestra el texto amable traducido (ej: "En progreso", "Creado") */}
                          {STATUS_LABELS[task.status] || task.status} 
                        </span>
                      </td>
                      {/*  Prioridad Tarea */}
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '12px', 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold', 
                          display: 'inline-block',
                          // 🎨 Colores dinámicos extraídos directamente del diccionario de estilos
                          background: PRIORITY_STYLES[task.priority]?.bg || '#f1f5f9', 
                          color: PRIORITY_STYLES[task.priority]?.color || '#475569' 
                        }}>
                          {/* Muestra el texto amable traducido (ej: "Crítica", "Baja") */}
                          {PRIORITY_LABELS[task.priority] || task.priority} 
                        </span>
                      </td>
                      {/* Dato Fecha Creación  */}
                      <td style={{ padding: '1rem', color: '#64748b' }}>{formatGlobalDate(task.createdAt)}</td> 
                      {/* Datos usuario de creación y usuario asignado  */}
                      {user?.role === 'ADMIN' && (
                        <>
                        <td style={{ padding: '1rem' }}>
                          {usersMap[task.createdByUserId] || task.createdByUserId}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {usersMap[task.assignedUserId] || task.assignedUserId}
                        </td>
                        </>
                      )}

                      {/* 🌟 INYECCIÓN DE BOTONES EXCLUSIVOS DE ADMINISTRADOR */}
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button 
                          title="Ver Detalle / Editar"
                          onClick={() => {
                            setSelectedTaskId(task.id);
                            setEditForm({
                              title: task.title || '',
                              description: task.description || '',
                              dueDate: task.dueDate ? task.dueDate.substring(0, 16) : '',
                              observations: task.observations || '',
                              status: task.status || ''
                            });
                            setIsEditOpen(true);
                          }}
                          style={{ padding: '0.3rem 0.6rem', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          ✏️
                        </button>
                        
                        {/* ⏳ BOTÓN DE asignar: Solo visible si el ROL es ADMIN */}
                        {user.role === 'ADMIN' && rules.canAssign(task, user) && (
                          <button 
                            title="Asignar Responsable"
                            onClick={() => {
                              setSelectedTaskId(task.id);
                              setSelectedAssigneeId(task.assignedUserId || '');
                              setIsAssignOpen(true); // 🌟 Levanta el nuevo modal exclusivo
                            }}
                            style={{ padding: '0.3rem 0.6rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            👤
                          </button>
                        )}

                        {/* ⏳ BOTÓN DE HISTORIAL: Solo visible si el ROL es ADMIN */}
                        {user.role === 'ADMIN' && (
                          <button 
                            title="Ver Historial de Cambios"
                            onClick={() => {
                              // 1. Guardamos el ID de la tarea seleccionada (gatilla el hook useTaskHistory)
                              setSelectedTaskId(task.id);
                              // 2. Abrimos el modal visualmente
                              setIsHistoryOpen(true);
                            }}
                            style={{ padding: '0.3rem 0.6rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            ⏳
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Ningún registro coincide.</td></tr>
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

              {taskDetail && (
                  <span style={{ 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: '12px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold', 
                    letterSpacing: '0.05em',
                    // 🎨 Colores de fondo dinámicos homologados con la tabla
                    background: (editForm.status || (taskDetail as any)?.data?.status) === 'COMPLETED' ? '#dcfce7' : 
                                (editForm.status || (taskDetail as any)?.data?.status) === 'IN_PROGRESS' ? '#dbeafe' : 
                                (editForm.status || (taskDetail as any)?.data?.status) === 'STOPPED' ? '#fef3c7' : '#f1f5f9', 
                    // 🎨 Colores de texto dinámicos homologados con la tabla
                    color: (editForm.status || (taskDetail as any)?.data?.status) === 'COMPLETED' ? '#15803d' : 
                           (editForm.status || (taskDetail as any)?.data?.status) === 'IN_PROGRESS' ? '#1d4ed8' : 
                           (editForm.status || (taskDetail as any)?.data?.status) === 'STOPPED' ? '#d97706' : '#475569' 
                  }}>
                    {/* 🌟 Muestra el texto amable en español (ej: "En progreso") buscando en tu diccionario global */}
                    {STATUS_LABELS[editForm.status || ''] || STATUS_LABELS[(taskDetail as any)?.data?.status || ''] || 'Cargando...'}
                  </span>
                )}

              <button type="button" onClick={() => { setIsEditOpen(false); setSelectedTaskId(null); }} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Título *</label>
                <input type="text" required disabled={isTaskReadOnly} value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', background: isTaskReadOnly ? '#f1f5f9' : 'white' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Descripción *</label>
                <textarea required rows={3} disabled={isTaskReadOnly} value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical', background: isTaskReadOnly ? '#f1f5f9' : 'white' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Fecha Compromiso</label>
                  <input type="datetime-local" disabled={isTaskReadOnly} value={editForm.dueDate} onChange={(e) => setEditForm(p => ({ ...p, dueDate: e.target.value }))} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', background: isTaskReadOnly ? '#f1f5f9' : 'white' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Observaciones</label>
                  <input type="text" disabled={isTaskReadOnly} value={editForm.observations} onChange={(e) => setEditForm(p => ({ ...p, observations: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', background: isTaskReadOnly ? '#f1f5f9' : 'white' }} />
                </div>
              </div>

              {/* BOTONES FINALES */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button type="button" onClick={() => { setIsEditOpen(false); setSelectedTaskId(null); }} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>Cerrar</button>
                
                {/* 🌟 FILTRO ABAC INDEPENDIENTE: Permite guardar si eres ADMIN o si eres el dueño de la tarea, excepto si está COMPLETED siendo USER */}
                {!(editForm.status === 'COMPLETED' && user?.role === 'USER') && (user?.role === 'ADMIN' || selectedTaskId !== null) && (
                  <button 
                    type="submit" 
                    disabled={actions.isSubmitting} 
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#16a34a', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    {actions.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                )}

              </div>

              {/* BOTONES DE ESTADO  */}    
              {/* LÓGICA DE COMENTARIOS HISTORIAL CONDICIONADA AL DTO DEL BACKEND */}
              {taskDetail && (
                <>
                  {/* 🚀 CONTROLES COMPLETOS DEL FLUJO DE TRABAJO (RF-06 a RF-09) */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                      Controles del Ciclo de Vida (Reglas de Transición RN)
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      
                      {/* RN-10: Iniciar Tarea -> Solo si está ASSIGNED */}
                      {taskDetail && (taskDetail as any).data?.status === 'ASSIGNED' && (
                        <button 
                          type="button" 
                          disabled={actions.isSubmitting}
                          onClick={async () => {
                            try {
                              await actions.startTask(selectedTaskId!);
                              setIsEditOpen(false);
                              setSelectedTaskId(null);
                            } catch { alert('Error al iniciar.'); }
                          }} 
                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                        >
                          🚀 Iniciar Tarea (IN_PROGRESS)
                        </button>
                      )}
                      
                      {/* RN-11: Detener Tarea -> Solo si está IN_PROGRESS */}
                      {taskDetail && (taskDetail as any).data?.status === 'IN_PROGRESS' && (
                        <button 
                          type="button" 
                          disabled={actions.isSubmitting}
                          onClick={async () => {
                            try {
                              await actions.stopTask(selectedTaskId!);
                              setIsEditOpen(false);
                              setSelectedTaskId(null);
                            } catch { alert('Error al detener.'); }
                          }} 
                          style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                        >
                          ⏸ Detener Trabajo (STOPPED)
                        </button>
                      )}

                      {/* 🌟 RN-12: Reanudar Tarea -> Solo si está STOPPED */}
                      {taskDetail && (taskDetail as any).data?.status === 'STOPPED' && (
                        <button 
                          type="button" 
                          disabled={actions.isSubmitting}
                          onClick={async () => {
                            try {
                              // Gatilla el POST /tasks/{id}/resume oficial de tu API
                              await actions.resumeTask(selectedTaskId!);
                              setIsEditOpen(false);
                              setSelectedTaskId(null);
                            } catch { alert('Error al reanudar.'); }
                          }} 
                          style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                        >
                          ▶ Reanudar Tarea (IN_PROGRESS)
                        </button>
                      )}

                      {/* 🌟 RN-13: Completar Tarea -> Solo si está IN_PROGRESS */}
                      {taskDetail && (taskDetail as any).data?.status === 'IN_PROGRESS' && (
                        <button 
                          type="button" 
                          disabled={actions.isSubmitting}
                          onClick={async () => {
                            try {
                              // Gatilla el POST /tasks/{id}/complete oficial de tu API
                              await actions.completeTask(selectedTaskId!);
                              setIsEditOpen(false);
                              setSelectedTaskId(null);
                            } catch { alert('Error al completar.'); }
                          }} 
                          style={{ background: '#16a34a', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                        >
                          ✔ Finalizar Tarea (COMPLETED)
                        </button>
                      )}

                    </div>
                  </div>
                  {/* COMENTARIOS pendiente */}
                </>
              )}

            </form>
          </div>
          
        </div>
      )}

      {/* MODAL CREACIÓN FLOTANTE (RF-01) */}
      {isCreateOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem' }}>Nueva Tarea Operativa</h3>
              <button type="button" onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            {formError && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>{formError}</div>}

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Título * (Mín: 5)</label>
                <input type="text" required value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Ej: Implementar integración Keycloak" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.9rem' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Descripción * (Mín: 10)</label>
                <textarea required rows={3} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Describe los alcances del requerimiento..." style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical', fontSize: '0.9rem' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Prioridad</label>
                  <select 
                    value={form.priority} 
                    onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as any }))} 
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.9rem' }}
                  >
                    {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((key) => (
                      <option key={key} value={key}>
                        {PRIORITY_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Fecha Compromiso</label>
                  <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))} style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.9rem' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Observaciones</label>
                <input type="text" value={form.observations} onChange={(e) => setForm((prev) => ({ ...prev, observations: e.target.value }))} placeholder="Notas internas adicionales..." style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.9rem' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>Cancelar</button>
                <button type="submit" disabled={actions.isSubmitting} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  {actions.isSubmitting ? 'Guardando...' : 'Crear Tarea'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 🌟 NUEVO: MODAL EXCLUSIVO DE ASIGNACIÓN CON COMBO DE USUARIOS (RF-05) */}
      {isAssignOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.15rem' }}>Asignar Responsable de Tarea</h3>
              <button type="button" onClick={() => { setIsAssignOpen(false); setSelectedTaskId(null); }} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                  Seleccionar Operador (Keycloak) *
                </label>

                {/* la lectura desde keycloak */}
                <select 
                  required
                  value={selectedAssigneeId} 
                  onChange={(e) => setSelectedAssigneeId(e.target.value)} 
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.9rem' }}
                >
                  <option value="">
                    {isLoadingUsers ? 'Conectando con Keycloak Master...' : '-- Seleccionar un responsable --'}
                  </option>
                  
                  {/* 🌟 Mapeo dinámico sobre los usuarios reales obtenidos del servidor */}
                  {keycloakUsersReal && keycloakUsersReal.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.id.substring(0, 8)}...)
                    </option>
                  ))}
                </select>
              </div>

              {/* CONTROLES DEL MODAL */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button type="button" onClick={() => { setIsAssignOpen(false); setSelectedTaskId(null); }} style={{ padding: '0.45rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={actions.isSubmitting} style={{ padding: '0.45rem 1rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  {actions.isSubmitting ? 'Procesando...' : 'Asignar Tarea'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 🌟 MODAL DE HISTORIAL DE CAMBIOS (Consumiendo TanStack Query en Tabla con Scroll) */}
      {isHistoryOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Cabecera del Modal Fija */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>⏳ Historial de Cambios y Auditoría</h3>
              <button 
                onClick={() => setIsHistoryOpen(false)} 
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {/* Contenido / Cuerpo con Contenedor de Scroll Vertical */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
              {isHistoryLoading ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Cargando historial...</div>
              ) : !historyData || historyData.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No existen registros de cambios para esta tarea.</div>
              ) : (
                /* 🌟 Contenedor de la Tabla con Scroll Vertical Fijo */
                <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#ffffff' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                        <th style={{ padding: '0.75rem' }}>Evento</th>
                        <th style={{ padding: '0.75rem' }}>Detalle de Modificación</th>
                        <th style={{ padding: '0.75rem' }}>Fecha Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          
                          {/* Columna Evento con Badge */}
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{ 
                              fontSize: '0.7rem', 
                              fontWeight: 'bold', 
                              padding: '0.2rem 0.4rem', 
                              borderRadius: '4px',
                              background: 
                                item.eventType === 'CREATED' ? '#dcfce7' : 
                                ['ASSIGNED', 'REASSIGNED'].includes(item.eventType) ? '#dbeafe' : 
                                ['STATUS_CHANGED', 'PRIORITY_CHANGED'].includes(item.eventType) ? '#f3e8ff' :
                                item.eventType === 'COMMENT_ADDED' ? '#e0f2fe' : '#fef3c7',
                              color: 
                                item.eventType === 'CREATED' ? '#15803d' : 
                                ['ASSIGNED', 'REASSIGNED'].includes(item.eventType) ? '#1d4ed8' : 
                                ['STATUS_CHANGED', 'PRIORITY_CHANGED'].includes(item.eventType) ? '#6b21a8' :
                                item.eventType === 'COMMENT_ADDED' ? '#0369a1' : '#b45309'
                            }}>
                              {item.eventType}
                            </span>
                          </td>

                          {/* Columna Detalle Lógico Dinámico */}
                          <td style={{ padding: '0.75rem', color: '#334155' }}>
                            {item.eventType === 'FIELD_CHANGED' && (
                              <span>
                                Modificó <strong>{item.comment}</strong>: 
                                <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginLeft: '4px' }}>"{item.previousValue || 'null'}"</span> 
                                ➡️ <span style={{ color: '#16a34a', fontWeight: '500' }}>"{item.newValue}"</span>
                              </span>
                            )}
                            {item.eventType === 'STATUS_CHANGED' && (
                              <span>
                                Estado: <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>{item.previousValue}</span> ➡️ <strong style={{ color: '#16a34a' }}>{item.newValue}</strong>
                              </span>
                            )}
                            {item.eventType === 'PRIORITY_CHANGED' && (
                              <span>
                                Prioridad: <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>{item.previousValue}</span> ➡️ <strong style={{ color: '#b45309' }}>{item.newValue}</strong>
                              </span>
                            )}
                            {item.eventType === 'COMMENT_ADDED' && (
                              <span>💬 Nota: <em style={{ color: '#475569' }}>"{item.newValue}"</em></span>
                            )}
                            {['ASSIGNED', 'REASSIGNED'].includes(item.eventType) && (
                              <span>
                                {item.eventType === 'ASSIGNED' ? '👤 Responsable:' : '🔄 Reasig. a:'}{' '}
                                <code style={{ background: '#f1f5f9', padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.75rem', color: '#0f172a' }}>{item.newValue}</code>
                              </span>
                            )}
                            {item.eventType === 'CREATED' && (
                              <span style={{ color: '#475569' }}>✨ Creación inicial del registro operativo.</span>
                            )}
                          </td>

                           {/* Columna Fecha con Formato Corporativo AM/PM */}
                          <td style={{ padding: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                            {formatGlobalDate(item.createdAt)}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pie del Modal / Botón de Salida Fijo */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'right', background: '#f1f5f9' }}>
              <button 
                onClick={() => setIsHistoryOpen(false)} 
                style={{ padding: '0.45rem 1.2rem', background: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
              >
                Cerrar Auditoría
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
    
  );
};