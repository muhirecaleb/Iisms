import React, { useState, useEffect, useCallback } from 'react';
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  listUsers,
} from '../../services/tasks.service';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// ─── Helpers ─────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
};

const priorityColors = {
  low: { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  normal: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
  high: { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  urgent: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
};

const statusColors = {
  pending: { bg: '#FFF7ED', text: '#C2410C', label: 'Pending' },
  in_progress: { bg: '#EFF6FF', text: '#1E40AF', label: 'In Progress' },
  completed: { bg: '#F0FDF4', text: '#166534', label: 'Completed' },
  cancelled: { bg: '#F9FAFB', text: '#6B7280', label: 'Cancelled' },
};

const statusIcons = {
  pending: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>,
  in_progress: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
  completed: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  cancelled: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
};

// ─── Modal ──────────────────────────────────────────────────
function Modal({ title, children, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: 560, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--color-border-light)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)', padding: 4, display: 'flex', minHeight: 'auto' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Task Card ──────────────────────────────────────────────
function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
  const p = priorityColors[task.priority] || priorityColors.normal;
  const s = statusColors[task.status] || statusColors.pending;
  const overdue = task.status !== 'completed' && task.status !== 'cancelled' && isOverdue(task.due_date);

  const nextStatus = task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : null;

  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: `1px solid ${overdue ? '#FECACA' : 'var(--color-border-light)'}`, padding: 0, overflow: 'hidden', transition: 'all 0.15s' }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
      {/* Priority stripe */}
      <div style={{ height: 3, background: task.priority === 'urgent' ? '#DC2626' : task.priority === 'high' ? '#F97316' : task.priority === 'normal' ? '#2563EB' : '#9CA3AF' }} />

      <div style={{ padding: '16px 20px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: task.status === 'completed' ? 'var(--color-text-light)' : 'var(--color-text-heading)', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</h4>
              {task.module_key && (
                <span style={{ padding: '1px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-primary)', background: 'rgba(26,86,219,0.08)' }}>{task.module_key}</span>
              )}
            </div>
            {task.description && (
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-light)', lineHeight: 1.4 }}>{task.description}</p>
            )}
          </div>

          {/* Status button */}
          {nextStatus && (
            <button onClick={() => onStatusChange(task.task_id, nextStatus)} style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, color: '#fff', background: nextStatus === 'in_progress' ? '#2563EB' : '#059669', border: 'none', borderRadius: 6, cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
              {statusIcons[nextStatus]} {statusColors[nextStatus]?.label}
            </button>
          )}
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
          {/* Status badge */}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600, color: s.text, background: s.bg }}>
            {statusIcons[task.status]} {s.label}
          </span>

          {/* Priority badge */}
          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, color: p.text, background: p.bg, border: `1px solid ${p.border}` }}>
            {task.priority}
          </span>

          {/* Due date */}
          {task.due_date && (
            <span style={{ fontSize: '0.75rem', color: overdue ? '#DC2626' : 'var(--color-text-light)', fontWeight: overdue ? 600 : 400 }}>
              {overdue && '⚠️ '}{formatDate(task.due_date)}
            </span>
          )}

          {/* Assignees */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
            {task.assigned_to_name && (
              <span title={`Assigned to: ${task.assigned_to_name}`}>👤 {task.assigned_to_name}</span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => onEdit(task)} style={{ padding: '3px 8px', fontSize: '0.72rem', fontWeight: 500, color: '#2563EB', background: 'rgba(37,99,235,0.08)', border: 'none', borderRadius: 4, cursor: 'pointer', minHeight: 'auto' }}>Edit</button>
            <button onClick={() => onDelete(task)} style={{ padding: '3px 8px', fontSize: '0.72rem', fontWeight: 500, color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: 'none', borderRadius: 4, cursor: 'pointer', minHeight: 'auto' }}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Task Form ──────────────────────────────────────────────
function TaskForm({ task, users, onSave, onCancel, saving }) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assigned_to || '',
    dueDate: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    priority: task?.priority || 'normal',
    moduleKey: task?.module_key || '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (touched[field]) validateField(field, e.target.value);
  };

  const handleBlur = (field) => () => {
    setTouched((p) => ({ ...p, [field]: true }));
    validateField(field, form[field]);
  };

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'title':
        if (!value) error = 'Title is required';
        else if (value.length < 3) error = 'Title must be at least 3 characters';
        break;
      case 'dueDate':
        if (value && form.dueDate && new Date(value) < new Date(new Date().toDateString())) {
          error = 'Due date cannot be in the past';
        }
        break;
    }
    setErrors((p) => ({ ...p, [field]: error }));
    return error;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = { title: true };
    setTouched(allTouched);
    if (!form.title) { setErrors({ title: 'Title is required' }); toast.error('Please fill in all required fields'); return; }
    onSave({
      title: form.title,
      description: form.description || null,
      assignedTo: form.assignedTo ? Number(form.assignedTo) : null,
      dueDate: form.dueDate || null,
      priority: form.priority,
      moduleKey: form.moduleKey || null,
    });
  };

  const fieldStyle = (field) => touched[field] && errors[field]
    ? { ...inputStyle, borderColor: '#DC2626' }
    : inputStyle;

  const modules = ['', 'students', 'staff', 'finance', 'academic', 'tasks', 'settings'];

  return (
    <Modal title={isEdit ? 'Edit Task' : 'Create Task'} onClose={onCancel}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Title <span style={{ color: 'var(--color-error)' }}>*</span></label>
          <input type="text" value={form.title} onChange={handleChange('title')} onBlur={handleBlur('title')} style={fieldStyle('title')} placeholder="e.g. Prepare Term 3 report cards" autoFocus />
          {touched.title && errors.title && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 4 }}>{errors.title}</div>}
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={handleChange('description')} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Optional details..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Assign To</label>
            <select value={form.assignedTo} onChange={handleChange('assignedTo')} style={inputStyle}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Due Date</label>
            <input type="date" value={form.dueDate} onChange={handleChange('dueDate')} onBlur={handleBlur('dueDate')} style={fieldStyle('dueDate')} />
            {touched.dueDate && errors.dueDate && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 4 }}>{errors.dueDate}</div>}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Priority</label>
            <select value={form.priority} onChange={handleChange('priority')} style={inputStyle}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Module</label>
            <select value={form.moduleKey} onChange={handleChange('moduleKey')} style={inputStyle}>
              <option value="">None</option>
              {modules.filter(Boolean).map((m) => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...submitBtnStyle, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function TasksPage() {
  const { canPerform } = useAuth();
  const canCreate = canPerform('tasks', 'create');
  const canEdit = canPerform('tasks', 'edit');
  const canDelete = canPerform('tasks', 'delete');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const data = await listTasks(params);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  // Overdue notification on load
  useEffect(() => {
    if (!loading && tasks.length > 0) {
      const overdueTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled' && isOverdue(t.due_date));
      if (overdueTasks.length > 0) {
        toast(`⚠️ You have ${overdueTasks.length} overdue task(s)`, {
          icon: '🚨',
          duration: 6000,
          style: { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' },
        });
      }
    }
  }, [loading, tasks]);

  // Periodic check every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTasks();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { listUsers().then(setUsers).catch(() => {}); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateTaskStatus(id, status);
      toast.success(`Task marked as ${statusColors[status]?.label || status}`);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateTask(editing.task_id, data);
        toast.success('Task updated');
      } else {
        await createTask(data);
        toast.success('Task created');
      }
      setEditing(null);
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(deleting.task_id);
      toast.success('Task deleted');
      setDeleting(null);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  // Stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled' && isOverdue(t.due_date)).length,
  };

  // Group by status for board view
  const grouped = {
    pending: tasks.filter((t) => t.status === 'pending'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    completed: tasks.filter((t) => t.status === 'completed'),
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>Tasks</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Track and manage tasks across the school</p>
      </div>

      {/* Overdue Alert */}
      {!loading && stats.overdue > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
          <span style={{ fontSize: '1.2rem' }}>&#x1F6A8;</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600, color: '#B91C1C', fontSize: '0.88rem' }}>{stats.overdue} overdue task(s)</span>
            <span style={{ color: '#9CA3AF', fontSize: '0.82rem', marginLeft: 8 }}>These tasks have passed their due date and need attention.</span>
          </div>
          <button onClick={() => setStatusFilter('pending')} style={{ padding: '5px 12px', fontSize: '0.78rem', fontWeight: 600, color: '#B91C1C', background: '#fff', border: '1px solid #FECACA', borderRadius: 6, cursor: 'pointer', minHeight: 'auto' }}>View Pending</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total', value: stats.total, color: '#6B7280' },
          { label: 'Pending', value: stats.pending, color: '#D97706' },
          { label: 'In Progress', value: stats.inProgress, color: '#2563EB' },
          { label: 'Completed', value: stats.completed, color: '#059669' },
          { label: 'Overdue', value: stats.overdue, color: '#DC2626' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-light)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setStatusFilter('')} style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: statusFilter === '' ? 600 : 500, color: statusFilter === '' ? '#fff' : 'var(--color-text)', background: statusFilter === '' ? 'var(--color-primary)' : '#fff', border: statusFilter === '' ? 'none' : '1px solid var(--color-border)', borderRadius: 16, cursor: 'pointer', minHeight: 'auto' }}>All</button>
          {Object.entries(statusColors).map(([key, val]) => (
            <button key={key} onClick={() => setStatusFilter(key)} style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: statusFilter === key ? 600 : 500, color: statusFilter === key ? '#fff' : val.text, background: statusFilter === key ? val.text : val.bg, border: 'none', borderRadius: 16, cursor: 'pointer', minHeight: 'auto' }}>{val.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', minHeight: 32, padding: '4px 10px', fontSize: '0.78rem' }}>
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button onClick={() => setViewMode(viewMode === 'board' ? 'list' : 'board')} style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 500, color: 'var(--color-text)', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 6, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            {viewMode === 'board' ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg> List</> : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> Board</>}
          </button>
          {canCreate && (
          <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', fontSize: '0.82rem', fontWeight: 600, color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 2px 8px rgba(26,86,219,0.2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Task
          </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-light)' }}>Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>&#x1F4CB;</div>
          <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--color-text-heading)' }}>No tasks found</p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-light)' }}>Click "New Task" to create your first task</p>
        </div>
      ) : viewMode === 'board' ? (
        /* Board View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { key: 'pending', label: 'Pending', color: '#D97706' },
            { key: 'in_progress', label: 'In Progress', color: '#2563EB' },
            { key: 'completed', label: 'Completed', color: '#059669' },
          ].map((col) => (
            <div key={col.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{col.label}</h3>
                <span style={{ padding: '1px 7px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-light)', background: 'var(--color-bg)' }}>{grouped[col.key]?.length || 0}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(grouped[col.key] || []).map((task) => (
                  <TaskCard key={task.task_id} task={task} onStatusChange={handleStatusChange} onEdit={(t) => setEditing(t)} onDelete={(t) => setDeleting(t)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border-light)' }}>
                <th style={thStyle}>Task</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Priority</th>
                <th style={thStyle}>Due Date</th>
                <th style={thStyle}>Assigned To</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const s = statusColors[task.status] || statusColors.pending;
                const p = priorityColors[task.priority] || priorityColors.normal;
                const overdue = task.status !== 'completed' && task.status !== 'cancelled' && isOverdue(task.due_date);
                return (
                  <tr key={task.task_id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500, color: task.status === 'completed' ? 'var(--color-text-light)' : 'var(--color-text-heading)', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: 2, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</div>}
                    </td>
                    <td style={tdStyle}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600, color: s.text, background: s.bg }}>{statusIcons[task.status]} {s.label}</span></td>
                    <td style={tdStyle}><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, color: p.text, background: p.bg, border: `1px solid ${p.border}` }}>{task.priority}</span></td>
                    <td style={tdStyle}><span style={{ fontSize: '0.8rem', color: overdue ? '#DC2626' : 'var(--color-text-light)', fontWeight: overdue ? 600 : 400 }}>{overdue && '⚠️ '}{formatDate(task.due_date)}</span></td>
                    <td style={tdStyle}><span style={{ fontSize: '0.8rem', color: 'var(--color-text)' }}>{task.assigned_to_name || '—'}</span></td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        {canEdit && <button onClick={() => setEditing(task)} style={{ padding: '3px 8px', fontSize: '0.72rem', fontWeight: 500, color: '#2563EB', background: 'rgba(37,99,235,0.08)', border: 'none', borderRadius: 4, cursor: 'pointer', minHeight: 'auto' }}>Edit</button>}
                        {canDelete && <button onClick={() => setDeleting(task)} style={{ padding: '3px 8px', fontSize: '0.72rem', fontWeight: 500, color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: 'none', borderRadius: 4, cursor: 'pointer', minHeight: 'auto' }}>Delete</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <TaskForm users={users} onSave={handleSave} onCancel={() => setShowForm(false)} saving={false} />}
      {editing && <TaskForm task={editing} users={users} onSave={handleSave} onCancel={() => setEditing(null)} saving={false} />}
      {deleting && (
        <Modal title="Delete Task" onClose={() => setDeleting(null)}>
          <p style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>Are you sure you want to delete this task?</p>
          <div style={{ padding: '10px 14px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
            <div style={{ fontWeight: 600, color: 'var(--color-text-heading)', fontSize: '0.9rem' }}>{deleting.title}</div>
            {deleting.description && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: 4 }}>{deleting.description}</div>}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleting(null)} style={cancelBtnStyle}>Cancel</button>
            <button onClick={handleDelete} style={{ ...submitBtnStyle, background: '#DC2626' }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const inputStyle = { width: '100%', minHeight: 36, padding: '7px 12px', fontSize: '0.85rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--color-text-heading)', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-heading)', marginBottom: 6 };
const thStyle = { padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.78rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' };
const tdStyle = { padding: '12px 16px' };
const cancelBtnStyle = { padding: '8px 16px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto' };
const submitBtnStyle = { padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto' };
