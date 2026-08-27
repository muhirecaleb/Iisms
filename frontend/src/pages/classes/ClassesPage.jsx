import { useState, useEffect, useCallback } from 'react';
import {
  listClasses,
  createClass,
  updateClass,
  deleteClass,
  listClassStudents,
} from '../../services/classes.service';
import toast from 'react-hot-toast';

// ─── Helpers ─────────────────────────────────────────────────
const formatName = (row) => {
  const first = row.first_name || '';
  const last = row.last_name || '';
  return `${first} ${last}`.trim() || '—';
};

const levelColors = {
  L1: '#059669',
  L2: '#2563EB',
  L3: '#7C3AED',
  L4: '#D97706',
  L5: '#DC2626',
};

// ─── Modal wrapper ──────────────────────────────────────────
function Modal({ title, children, onClose, wide }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#fff', borderRadius: 'var(--radius-md)',
          width: '100%', maxWidth: wide ? 720 : 520, maxHeight: '85vh',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px', borderBottom: '1px solid var(--color-border-light)',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-light)', padding: 4, display: 'flex', minHeight: 'auto',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ─────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <Modal title="Confirm" onClose={onCancel}>
      <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: 'var(--color-text)' }}>{message}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '8px 20px', fontSize: '0.85rem', fontWeight: 500,
            color: 'var(--color-text)', background: 'var(--color-bg)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', minHeight: 'auto',
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            padding: '8px 20px', fontSize: '0.85rem', fontWeight: 600,
            color: '#fff', background: 'var(--color-error)',
            border: 'none', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', minHeight: 'auto', opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Class Form (Create / Edit) ─────────────────────────────
function ClassForm({ cls, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    className: '',
    trade: '',
    level: '',
    ...(cls || {}),
  });

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.className?.trim()) {
      toast.error('Class name is required');
      return;
    }
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Class Name *" required>
          <input
            type="text"
            value={form.className}
            onChange={handleChange('className')}
            style={inputStyle}
            placeholder="e.g. L3 SOD A"
            autoFocus
          />
        </Field>
        <Field label="Trade / Program">
          <input
            type="text"
            value={form.trade || ''}
            onChange={handleChange('trade')}
            style={inputStyle}
            placeholder="e.g. Software Development"
          />
        </Field>
        <Field label="Level">
          <select value={form.level || ''} onChange={handleChange('level')} style={inputStyle}>
            <option value="">Select level...</option>
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
            <option value="L4">L4</option>
            <option value="L5">L5</option>
          </select>
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border-light)' }}>
        <button type="button" onClick={onCancel} disabled={saving} style={cancelBtnStyle}>Cancel</button>
        <button type="submit" disabled={saving} style={{ ...submitBtnStyle, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : cls ? 'Update Class' : 'Add Class'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-heading)', marginBottom: 6 }}>
        {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Student Enrollment Panel ────────────────────────────────
function StudentEnrollmentPanel({ classId, className, onClose }) {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await listClassStudents(classId, { page, limit: 20, search: debouncedSearch });
      setStudents(result.data || []);
      setPagination(result.pagination || { page, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [classId, debouncedSearch]);

  useEffect(() => {
    fetchStudents(1);
  }, [fetchStudents]);

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) fetchStudents(page);
  };

  return (
    <Modal title={`Students in ${className}`} onClose={onClose} wide>
      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        padding: '10px 14px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border-light)',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: 'var(--color-text-light)' }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or admission number..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.85rem', color: 'var(--color-text-heading)', background: 'transparent', minHeight: 'auto', padding: 0 }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)', padding: 4, display: 'flex', minHeight: 'auto' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-light)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border-light)' }}>
                <Th>Admission No</Th>
                <Th>Full Name</Th>
                <Th>Gender</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} style={{ padding: '12px 14px' }}>
                        <div style={{ height: 14, background: 'var(--color-border)', borderRadius: 4, width: '80%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px 14px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                    {debouncedSearch ? 'No students match your search' : 'No students enrolled in this class'}
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr
                    key={s.student_id}
                    style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-heading)', fontWeight: 600 }}>
                        {s.admission_no || '—'}
                      </span>
                    </Td>
                    <Td>
                      <span style={{ fontWeight: 500, color: 'var(--color-text-heading)' }}>
                        {formatName(s)}
                      </span>
                    </Td>
                    <Td>
                      <span style={{ color: s.gender === 'F' ? '#DC2626' : '#2563EB', fontWeight: 500 }}>
                        {s.gender === 'F' ? 'Female' : 'Male'}
                      </span>
                    </Td>
                    <Td>
                      <StatusBadge status={s.status} />
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12, padding: '12px 14px',
            borderTop: '1px solid var(--color-border-light)', background: 'var(--color-bg)',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <PageBtn disabled={pagination.page <= 1} onClick={() => goToPage(pagination.page - 1)}>Previous</PageBtn>
              <PageBtn disabled={pagination.page >= pagination.totalPages} onClick={() => goToPage(pagination.page + 1)}>Next</PageBtn>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Status Badge ────────────────────────────────────────────
function StatusBadge({ status }) {
  const colors = { active: '#059669', transferred: '#D97706', graduated: '#2563EB', dropped: '#DC2626' };
  const labels = { active: 'Active', transferred: 'Transferred', graduated: 'Graduated', dropped: 'Dropped' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 20,
      fontSize: '0.75rem', fontWeight: 600, color: '#fff',
      background: colors[status] || '#64748B',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
      {labels[status] || status || 'Unknown'}
    </span>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Student enrollment panel
  const [viewingClass, setViewingClass] = useState(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listClasses();
      setClasses(data || []);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Filtered classes
  const filtered = classes.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (c.class_name || '').toLowerCase().includes(term) ||
      (c.trade || '').toLowerCase().includes(term) ||
      (c.level || '').toLowerCase().includes(term)
    );
  });

  // ─── Create ─────────────────────────────────────────────
  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createClass(data);
      toast.success('Class created!');
      setShowForm(false);
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create class');
    } finally {
      setSaving(false);
    }
  };

  // ─── Update ─────────────────────────────────────────────
  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await updateClass(editingClass.class_id, data);
      toast.success('Class updated!');
      setEditingClass(null);
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update class');
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ─────────────────────────────────────────────
  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteClass(deleting.class_id);
      toast.success('Class deleted');
      setDeleting(null);
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete class');
    } finally {
      setSaving(false);
    }
  };

  // Stats
  const totalStudents = classes.reduce((sum, c) => sum + (c.student_count || 0), 0);
  const totalMale = classes.reduce((sum, c) => sum + (c.male_count || 0), 0);
  const totalFemale = classes.reduce((sum, c) => sum + (c.female_count || 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16, marginBottom: 24,
      }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>
            Classes
          </h1>
          {!loading && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
              {classes.length} class{classes.length !== 1 ? 'es' : ''} · {totalStudents} student{totalStudents !== 1 ? 's' : ''} enrolled
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', fontSize: '0.85rem', fontWeight: 600,
            color: '#fff', background: 'var(--color-primary)',
            border: 'none', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 4px 12px rgba(26, 86, 219, 0.3)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Class
        </button>
      </div>

      {/* Stats Row */}
      {!loading && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16, marginBottom: 24,
        }}>
          <StatCard label="Total Classes" value={classes.length} color="#2563EB" />
          <StatCard label="Total Students" value={totalStudents} color="#059669" />
          <StatCard label="Male Students" value={totalMale} color="#2563EB" />
          <StatCard label="Female Students" value={totalFemale} color="#DC2626" />
        </div>
      )}

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        padding: '12px 16px', background: '#fff', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border-light)',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: 'var(--color-text-light)' }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by class name, trade, or level..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--color-text-heading)', background: 'transparent', minHeight: 'auto', padding: 0 }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)', padding: 4, display: 'flex', minHeight: 'auto' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-light)', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border-light)' }}>
                <Th>Class Name</Th>
                <Th>Level</Th>
                <Th>Trade / Program</Th>
                <Th style={{ textAlign: 'center' }}>Students</Th>
                <Th style={{ textAlign: 'center' }}>Male</Th>
                <Th style={{ textAlign: 'center' }}>Female</Th>
                <Th style={{ textAlign: 'right' }}>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div style={{ height: 14, background: 'var(--color-border)', borderRadius: 4, width: j === 0 ? '70%' : j === 6 ? '30%' : '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                    {search ? 'No classes match your search' : 'No classes yet. Create one to get started.'}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.class_id}
                    style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Td>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>
                        {c.class_name}
                      </span>
                    </Td>
                    <Td>
                      {c.level ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '2px 8px', borderRadius: 4,
                          fontSize: '0.75rem', fontWeight: 700,
                          color: levelColors[c.level] || '#64748B',
                          background: `${levelColors[c.level] || '#64748B'}12`,
                        }}>
                          {c.level}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-light)' }}>—</span>
                      )}
                    </Td>
                    <Td>
                      <span style={{ color: 'var(--color-text)' }}>
                        {c.trade || <span style={{ color: 'var(--color-text-light)', fontStyle: 'italic' }}>No trade</span>}
                      </span>
                    </Td>
                    <Td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        minWidth: 32, height: 24, borderRadius: 12,
                        fontSize: '0.8rem', fontWeight: 700,
                        color: c.student_count > 0 ? '#fff' : 'var(--color-text-light)',
                        background: c.student_count > 0 ? 'var(--color-primary)' : 'var(--color-bg)',
                        border: c.student_count > 0 ? 'none' : '1px solid var(--color-border)',
                      }}>
                        {c.student_count || 0}
                      </span>
                    </Td>
                    <Td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 500 }}>
                        {c.male_count || 0}
                      </span>
                    </Td>
                    <Td style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#DC2626', fontWeight: 500 }}>
                        {c.female_count || 0}
                      </span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <ActionBtn
                          title="View Students"
                          onClick={() => setViewingClass(c)}
                          color="#059669"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </ActionBtn>
                        <ActionBtn
                          title="Edit"
                          onClick={() => setEditingClass(c)}
                          color="#2563EB"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </ActionBtn>
                        <ActionBtn
                          title="Delete"
                          onClick={() => setDeleting(c)}
                          color="#DC2626"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </ActionBtn>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Class Modal */}
      {showForm && (
        <Modal title="Add New Class" onClose={() => setShowForm(false)}>
          <ClassForm onSave={handleCreate} onCancel={() => setShowForm(false)} saving={saving} />
        </Modal>
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <Modal title="Edit Class" onClose={() => setEditingClass(null)}>
          <ClassForm cls={editingClass} onSave={handleUpdate} onCancel={() => setEditingClass(null)} saving={saving} />
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleting.class_name}"? This will permanently remove the class.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={saving}
        />
      )}

      {/* Student Enrollment Panel */}
      {viewingClass && (
        <StudentEnrollmentPanel
          classId={viewingClass.class_id}
          className={viewingClass.class_name}
          onClose={() => setViewingClass(null)}
        />
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-md)', padding: 18,
      border: '1px solid var(--color-border-light)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)', marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-light)' }}>{label}</div>
    </div>
  );
}

// ─── Table helpers ──────────────────────────────────────────
function Th({ children, style, ...props }) {
  return (
    <th
      style={{
        padding: '12px 16px', textAlign: 'left', fontWeight: 600,
        fontSize: '0.8rem', color: 'var(--color-text-light)',
        textTransform: 'uppercase', letterSpacing: 0.5,
        whiteSpace: 'nowrap', ...style,
      }}
      {...props}
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{children}</td>;
}

function ActionBtn({ children, onClick, title, color }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 32, height: 32, display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', background: `${color}0a`, border: `1px solid ${color}20`,
        borderRadius: 8, cursor: 'pointer', color, minHeight: 'auto',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.borderColor = `${color}40`; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = `${color}0a`; e.currentTarget.style.borderColor = `${color}20`; }}
    >
      {children}
    </button>
  );
}

function PageBtn({ children, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 12px', fontSize: '0.8rem', fontWeight: active ? 600 : 500,
        color: active ? '#fff' : 'var(--color-text)',
        background: active ? 'var(--color-primary)' : 'transparent',
        border: active ? 'none' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)', cursor: disabled ? 'default' : 'pointer',
        minHeight: 'auto', opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

// ─── Style constants ────────────────────────────────────────
const inputStyle = {
  width: '100%', minHeight: 40, padding: '8px 12px',
  fontSize: '0.85rem', border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)', background: '#fff',
  color: 'var(--color-text-heading)', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
};

const cancelBtnStyle = {
  padding: '9px 22px', fontSize: '0.85rem', fontWeight: 500,
  color: 'var(--color-text)', background: 'var(--color-bg)',
  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
  cursor: 'pointer', minHeight: 'auto',
};

const submitBtnStyle = {
  padding: '9px 22px', fontSize: '0.85rem', fontWeight: 600,
  color: '#fff', background: 'var(--color-primary)',
  border: 'none', borderRadius: 'var(--radius-sm)',
  cursor: 'pointer', minHeight: 'auto',
};
