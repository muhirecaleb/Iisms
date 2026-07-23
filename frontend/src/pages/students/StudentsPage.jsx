import { useState, useEffect, useCallback } from 'react';
import { listStudents, createStudent, updateStudent, deleteStudent } from '../../services/student.service';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ─── Helpers ─────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatName = (row) => {
  const first = row.first_name || row.firstName || '';
  const last = row.last_name || row.lastName || '';
  return `${first} ${last}`.trim() || '—';
};

const statusColors = {
  active: '#059669',
  transferred: '#D97706',
  graduated: '#2563EB',
  dropped: '#DC2626',
};

const statusLabels = {
  active: 'Active',
  transferred: 'Transferred',
  graduated: 'Graduated',
  dropped: 'Dropped',
};

// ─── Modal wrapper ──────────────────────────────────────────
function Modal({ title, children, onClose }) {
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
          width: '100%', maxWidth: 560, maxHeight: '85vh',
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

// ─── Section Divider ────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div style={{ gridColumn: '1 / -1', marginTop: 8, marginBottom: 4 }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--color-primary)' }}>{label}</span>
      <div style={{ height: 1, background: 'var(--color-border-light)', marginTop: 6 }} />
    </div>
  );
}

// ─── Student Form (Create / Edit) ──────────────────────────
function StudentForm({ student, onSave, onCancel, saving, classes }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: 'M',
    dateOfBirth: '',
    nationality: 'Rwandan',
    residenceStatus: 'Resident',
    disability: '',
    parenthood: '',
    fatherName: '',
    motherName: '',
    email: '',
    phone: '',
    officialPaperType: '',
    officialPaperNo: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    detailAddress: '',
    classId: '',
    nationalStudentCode: '',
    status: 'active',
    ...(student || {}),
  });

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName?.trim() || !form.lastName?.trim()) {
      toast.error('First name and last name are required');
      return;
    }
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Personal Information */}
        <SectionDivider label="Personal Information" />
        <Field label="First Name *" required>
          <input type="text" value={form.firstName} onChange={handleChange('firstName')} style={inputStyle} placeholder="John" />
        </Field>
        <Field label="Last Name *" required>
          <input type="text" value={form.lastName} onChange={handleChange('lastName')} style={inputStyle} placeholder="Doe" />
        </Field>
        <Field label="Gender">
          <select value={form.gender} onChange={handleChange('gender')} style={inputStyle}>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </Field>
        <Field label="Date of Birth">
          <input type="date" value={form.dateOfBirth || ''} onChange={handleChange('dateOfBirth')} style={inputStyle} />
        </Field>
        <Field label="Nationality">
          <input type="text" value={form.nationality} onChange={handleChange('nationality')} style={inputStyle} placeholder="Rwandan" />
        </Field>
        <Field label="Residence Status">
          <select value={form.residenceStatus} onChange={handleChange('residenceStatus')} style={inputStyle}>
            <option value="Resident">Resident</option>
            <option value="Refugee">Refugee</option>
            <option value="Non-resident">Non-resident</option>
          </select>
        </Field>
        <Field label="National Student Code">
          <input type="text" value={form.nationalStudentCode || ''} onChange={handleChange('nationalStudentCode')} style={inputStyle} placeholder="NAT/XXXXX" />
        </Field>
        <Field label="Disability">
          <input type="text" value={form.disability || ''} onChange={handleChange('disability')} style={inputStyle} placeholder="None" />
        </Field>

        {/* Parent / Guardian Details */}
        <SectionDivider label="Parent / Guardian Details" />
        <Field label="Father's Name">
          <input type="text" value={form.fatherName || ''} onChange={handleChange('fatherName')} style={inputStyle} placeholder="Father's full name" />
        </Field>
        <Field label="Mother's Name">
          <input type="text" value={form.motherName || ''} onChange={handleChange('motherName')} style={inputStyle} placeholder="Mother's full name" />
        </Field>
        <Field label="Parenthood Status">
          <select value={form.parenthood} onChange={handleChange('parenthood')} style={inputStyle}>
            <option value="">Select...</option>
            <option value="Both Parents">Both Parents</option>
            <option value="Single Parent">Single Parent</option>
            <option value="Orphan (Father)">Orphan (Father)</option>
            <option value="Orphan (Mother)">Orphan (Mother)</option>
            <option value="Orphan (Both)">Orphan (Both)</option>
            <option value="Guardian">Guardian</option>
          </select>
        </Field>

        {/* Contact */}
        <SectionDivider label="Contact" />
        <Field label="Email">
          <input type="email" value={form.email || ''} onChange={handleChange('email')} style={inputStyle} placeholder="john@school.rw" />
        </Field>
        <Field label="Phone">
          <input type="tel" value={form.phone || ''} onChange={handleChange('phone')} style={inputStyle} placeholder="+250 78X XXX XXX" />
        </Field>

        {/* Official Documents */}
        <SectionDivider label="Official Documents" />
        <Field label="Paper Type">
          <select value={form.officialPaperType} onChange={handleChange('officialPaperType')} style={inputStyle}>
            <option value="">Select...</option>
            <option value="Birth Certificate">Birth Certificate</option>
            <option value="Passport">Passport</option>
            <option value="National ID">National ID</option>
            <option value="Refugee Card">Refugee Card</option>
          </select>
        </Field>
        <Field label="Paper Number">
          <input type="text" value={form.officialPaperNo || ''} onChange={handleChange('officialPaperNo')} style={inputStyle} placeholder="Document number" />
        </Field>

        {/* Address */}
        <SectionDivider label="Address" />
        <Field label="Province">
          <input type="text" value={form.province || ''} onChange={handleChange('province')} style={inputStyle} placeholder="e.g. Kigali" />
        </Field>
        <Field label="District">
          <input type="text" value={form.district || ''} onChange={handleChange('district')} style={inputStyle} placeholder="e.g. Gasabo" />
        </Field>
        <Field label="Sector">
          <input type="text" value={form.sector || ''} onChange={handleChange('sector')} style={inputStyle} placeholder="e.g. Kimironko" />
        </Field>
        <Field label="Cell">
          <input type="text" value={form.cell || ''} onChange={handleChange('cell')} style={inputStyle} placeholder="e.g. Kibiraro" />
        </Field>
        <Field label="Village">
          <input type="text" value={form.village || ''} onChange={handleChange('village')} style={inputStyle} placeholder="e.g. Isimbi" />
        </Field>
        <Field label="Detail Address">
          <input type="text" value={form.detailAddress || ''} onChange={handleChange('detailAddress')} style={inputStyle} placeholder="Street, house no, etc." />
        </Field>

        {/* Enrollment */}
        {!student && (
          <>
            <SectionDivider label="Enrollment" />
            <Field label="Class" required>
              <select value={form.classId} onChange={handleChange('classId')} style={inputStyle}>
                <option value="">Select class...</option>
                {classes.map((c) => (
                  <option key={c.class_id} value={c.class_id}>
                    {c.class_name}{c.level ? ` (${c.level})` : ''}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}
        {student && (
          <>
            <SectionDivider label="Status" />
            <Field label="Status">
              <select value={form.status} onChange={handleChange('status')} style={inputStyle}>
                <option value="active">Active</option>
                <option value="transferred">Transferred</option>
                <option value="graduated">Graduated</option>
                <option value="dropped">Dropped</option>
              </select>
            </Field>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border-light)' }}>
        <button type="button" onClick={onCancel} disabled={saving} style={{
            padding: '9px 22px', fontSize: '0.85rem', fontWeight: 500,
            color: 'var(--color-text)', background: 'var(--color-bg)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', minHeight: 'auto',
          }}>Cancel</button>
        <button type="submit" disabled={saving} style={{
            padding: '9px 22px', fontSize: '0.85rem', fontWeight: 600,
            color: '#fff', background: 'var(--color-primary)',
            border: 'none', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', minHeight: 'auto', opacity: saving ? 0.7 : 1,
          }}>{saving ? 'Saving...' : student ? 'Update Student' : 'Add Student'}</button>
      </div>
    </form>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '0.8rem', fontWeight: 600,
        color: 'var(--color-text-heading)', marginBottom: 6,
      }}>
        {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', minHeight: 40, padding: '8px 12px',
  fontSize: '0.85rem', border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)', background: '#fff',
  color: 'var(--color-text-heading)', outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

// ─── Main Page ──────────────────────────────────────────────
export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [classes, setClasses] = useState([]);

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Fetch classes for the dropdown
  const fetchClasses = useCallback(async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data.data || []);
    } catch {
      // Silent fail - classes dropdown just won't show
    }
  }, []);

  // Fetch classes when form opens
  useEffect(() => {
    if (showForm) fetchClasses();
  }, [showForm, fetchClasses]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await listStudents({ page, limit: 20, search: debouncedSearch });
      setStudents(result.data || []);
      setPagination(result.pagination || { page, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchStudents(1);
  }, [fetchStudents]);

  // ─── Create ─────────────────────────────────────────────
  const handleCreate = async (data) => {
    if (!data.classId) {
      toast.error('Please select a class');
      return;
    }
    setSaving(true);
    try {
      await createStudent({
        ...data,
        classId: Number(data.classId),
      });
      toast.success('Student created!');
      setShowForm(false);
      fetchStudents(1);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create student');
    } finally {
      setSaving(false);
    }
  };

  // ─── Update ─────────────────────────────────────────────
  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await updateStudent(editingStudent.student_id, data);
      toast.success('Student updated!');
      setEditingStudent(null);
      fetchStudents(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ─────────────────────────────────────────────
  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteStudent(deleting.student_id);
      toast.success('Student removed');
      setDeleting(null);
      fetchStudents(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete student');
    } finally {
      setSaving(false);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchStudents(page);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16, marginBottom: 24,
      }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>
            Students
          </h1>
          {!loading && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
              {pagination.total} student{pagination.total !== 1 ? 's' : ''} enrolled
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
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(26, 86, 219, 0.3)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Student
        </button>
      </div>

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
          placeholder="Search by name or admission number..."
          style={{
            flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem',
            color: 'var(--color-text-heading)', background: 'transparent',
            minHeight: 'auto', padding: 0,
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-light)', padding: 4, display: 'flex', minHeight: 'auto',
            }}
          >
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
                <Th>Admission No</Th>
                <Th>Full Name</Th>
                <Th>Gender</Th>
                <Th>Class</Th>
                <Th>Status</Th>
                <Th style={{ textAlign: 'right' }}>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div style={{
                          height: 14, background: 'var(--color-border)', borderRadius: 4,
                          width: j === 1 ? '60%' : j === 5 ? '30%' : '80%',
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                    {debouncedSearch ? 'No students match your search' : 'No students yet'}
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
                      <span style={{
                        fontFamily: 'monospace', fontSize: '0.8rem',
                        color: 'var(--color-text-heading)', fontWeight: 600,
                      }}>
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
                        {s.gender === 'F' ? 'Female' : s.gender === 'M' ? 'Male' : '—'}
                      </span>
                    </Td>
                    <Td>
                      <span style={{ color: 'var(--color-text)' }}>
                        {s.class_name || '—'}
                        {s.level ? ` (${s.level})` : ''}
                      </span>
                    </Td>
                    <Td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: '0.75rem', fontWeight: 600,
                        color: '#fff',
                        background: statusColors[s.status] || '#64748B',
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: 'rgba(255,255,255,0.6)',
                        }} />
                        {statusLabels[s.status] || s.status || 'Unknown'}
                      </span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <ActionBtn
                          title="Edit"
                          onClick={() => setEditingStudent(s)}
                          color="#2563EB"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </ActionBtn>
                        <ActionBtn
                          title="Delete"
                          onClick={() => setDeleting(s)}
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

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12, padding: '14px 16px',
            borderTop: '1px solid var(--color-border-light)',
            background: 'var(--color-bg)',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <PageBtn
                disabled={pagination.page <= 1}
                onClick={() => goToPage(pagination.page - 1)}
              >
                Previous
              </PageBtn>
              {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => {
                let pageNum;
                if (pagination.totalPages <= 7) {
                  pageNum = i + 1;
                } else if (pagination.page <= 4) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 3) {
                  pageNum = pagination.totalPages - 6 + i;
                } else {
                  pageNum = pagination.page - 3 + i;
                }
                return (
                  <PageBtn
                    key={pageNum}
                    active={pageNum === pagination.page}
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </PageBtn>
                );
              })}
              <PageBtn
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => goToPage(pagination.page + 1)}
              >
                Next
              </PageBtn>
            </div>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showForm && (
        <Modal title="Add New Student" onClose={() => setShowForm(false)}>
          <StudentForm
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
            saving={saving}
            classes={classes}
          />
        </Modal>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <Modal title="Edit Student" onClose={() => setEditingStudent(null)}>
          <StudentForm
            student={{
              firstName: editingStudent.first_name || '',
              lastName: editingStudent.last_name || '',
              gender: editingStudent.gender || 'M',
              dateOfBirth: editingStudent.date_of_birth ? editingStudent.date_of_birth.split('T')[0] : '',
              nationality: editingStudent.nationality ?? 'Rwandan',
              residenceStatus: editingStudent.residence_status ?? 'Resident',
              disability: editingStudent.disability || '',
              parenthood: editingStudent.parenthood || '',
              fatherName: editingStudent.father_name || '',
              motherName: editingStudent.mother_name || '',
              email: editingStudent.email || '',
              phone: editingStudent.phone || '',
              officialPaperType: editingStudent.official_paper_type || '',
              officialPaperNo: editingStudent.official_paper_no || '',
              province: editingStudent.province || '',
              district: editingStudent.district || '',
              sector: editingStudent.sector || '',
              cell: editingStudent.cell || '',
              village: editingStudent.village || '',
              detailAddress: editingStudent.detail_address || '',
              nationalStudentCode: editingStudent.national_student_code || '',
              status: editingStudent.status || 'active',
            }}
            onSave={handleUpdate}
            onCancel={() => setEditingStudent(null)}
            saving={saving}
          />
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <ConfirmDialog
          message={`Are you sure you want to remove "${formatName(deleting)}"? This action can be undone by an administrator.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={saving}
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
