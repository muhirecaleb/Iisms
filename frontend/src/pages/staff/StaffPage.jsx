import { useState, useEffect, useCallback } from 'react';
import { listStaff, createStaff, updateStaff, deleteStaff } from '../../services/staff.service';
import toast from 'react-hot-toast';

// ─── Helpers ─────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const statusColors = {
  active: '#059669',
  on_leave: '#D97706',
  resigned: '#64748B',
  terminated: '#DC2626',
};

const statusLabels = {
  active: 'Active',
  on_leave: 'On Leave',
  resigned: 'Resigned',
  terminated: 'Terminated',
};

const categoryColors = {
  Teaching: '#2563EB',
  Administrative: '#7C3AED',
  Support: '#0891B2',
};

// ─── Modal ──────────────────────────────────────────────────
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
          width: '100%', maxWidth: 600, maxHeight: '85vh',
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
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)', padding: 4, display: 'flex', minHeight: 'auto' }}>
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
        <button onClick={onCancel} disabled={loading} style={{ padding: '8px 20px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto' }}>Cancel</button>
        <button onClick={onConfirm} disabled={loading} style={{ padding: '8px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#fff', background: 'var(--color-error)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto', opacity: loading ? 0.7 : 1 }}>{loading ? 'Deleting...' : 'Delete'}</button>
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

// ─── Staff Form ─────────────────────────────────────────────
function StaffForm({ staff, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    fullName: '',
    gender: 'M',
    maritalStatus: '',
    nationality: 'Rwandan',
    idPassportNo: '',
    staffCategory: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    highestQualification: '',
    domain: '',
    subDomain: '',
    fieldOfStudy: '',
    graduationDate: '',
    staffPosition: '',
    employmentDateEducation: '',
    employmentDateSchool: '',
    contractType: '',
    staffBank: '',
    accountNumber: '',
    staffRssbNumber: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    detailAddress: '',
    status: 'active',
    ...(staff || {}),
  });

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName?.trim()) { toast.error('Full name is required'); return; }
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Personal Information */}
        <SectionDivider label="Personal Information" />
        <Field label="Full Name *" required>
          <input type="text" value={form.fullName} onChange={handleChange('fullName')} style={inputStyle} placeholder="John Doe" />
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
        <Field label="Marital Status">
          <select value={form.maritalStatus} onChange={handleChange('maritalStatus')} style={inputStyle}>
            <option value="">Select...</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </Field>
        <Field label="Nationality">
          <input type="text" value={form.nationality} onChange={handleChange('nationality')} style={inputStyle} placeholder="Rwandan" />
        </Field>
        <Field label="ID/Passport No">
          <input type="text" value={form.idPassportNo || ''} onChange={handleChange('idPassportNo')} style={inputStyle} placeholder="119XX XXXXXXXX XXXX" />
        </Field>

        {/* Contact */}
        <SectionDivider label="Contact" />
        <Field label="Phone">
          <input type="tel" value={form.phoneNumber || ''} onChange={handleChange('phoneNumber')} style={inputStyle} placeholder="+250 78X XXX XXX" />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email || ''} onChange={handleChange('email')} style={inputStyle} placeholder="name@school.rw" />
        </Field>

        {/* Employment */}
        <SectionDivider label="Employment Details" />
        <Field label="Staff Category">
          <select value={form.staffCategory} onChange={handleChange('staffCategory')} style={inputStyle}>
            <option value="">Select...</option>
            <option value="Teaching">Teaching</option>
            <option value="Administrative">Administrative</option>
            <option value="Support">Support</option>
          </select>
        </Field>
        <Field label="Staff Position">
          <input type="text" value={form.staffPosition || ''} onChange={handleChange('staffPosition')} style={inputStyle} placeholder="e.g. Head Teacher" />
        </Field>
        <Field label="Contract Type">
          <select value={form.contractType} onChange={handleChange('contractType')} style={inputStyle}>
            <option value="">Select...</option>
            <option value="Permanent">Permanent</option>
            <option value="Fixed-term">Fixed-term</option>
            <option value="Probation">Probation</option>
            <option value="Volunteer">Volunteer</option>
          </select>
        </Field>
        <Field label="Employment Date (School)">
          <input type="date" value={form.employmentDateSchool || ''} onChange={handleChange('employmentDateSchool')} style={inputStyle} />
        </Field>
        <Field label="Employment Date (Education)">
          <input type="date" value={form.employmentDateEducation || ''} onChange={handleChange('employmentDateEducation')} style={inputStyle} />
        </Field>
        {staff && (
          <Field label="Status">
            <select value={form.status} onChange={handleChange('status')} style={inputStyle}>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="resigned">Resigned</option>
              <option value="terminated">Terminated</option>
            </select>
          </Field>
        )}

        {/* Qualifications */}
        <SectionDivider label="Qualifications" />
        <Field label="Highest Qualification">
          <select value={form.highestQualification} onChange={handleChange('highestQualification')} style={inputStyle}>
            <option value="">Select...</option>
            <option value="High School">High School</option>
            <option value="Diploma">Diploma</option>
            <option value="Bachelor">Bachelor's Degree</option>
            <option value="Master">Master's Degree</option>
            <option value="PhD">PhD / Doctorate</option>
          </select>
        </Field>
        <Field label="Field of Study">
          <input type="text" value={form.fieldOfStudy || ''} onChange={handleChange('fieldOfStudy')} style={inputStyle} placeholder="e.g. Mathematics" />
        </Field>
        <Field label="Domain">
          <input type="text" value={form.domain || ''} onChange={handleChange('domain')} style={inputStyle} placeholder="e.g. Sciences" />
        </Field>
        <Field label="Sub Domain">
          <input type="text" value={form.subDomain || ''} onChange={handleChange('subDomain')} style={inputStyle} placeholder="e.g. Physics" />
        </Field>
        <Field label="Graduation Date">
          <input type="date" value={form.graduationDate || ''} onChange={handleChange('graduationDate')} style={inputStyle} />
        </Field>

        {/* Financial */}
        <SectionDivider label="Financial" />
        <Field label="Bank Name">
          <input type="text" value={form.staffBank || ''} onChange={handleChange('staffBank')} style={inputStyle} placeholder="e.g. Bank of Kigali" />
        </Field>
        <Field label="Account Number">
          <input type="text" value={form.accountNumber || ''} onChange={handleChange('accountNumber')} style={inputStyle} placeholder="000XXXXXXX" />
        </Field>
        <Field label="RSSB Number">
          <input type="text" value={form.staffRssbNumber || ''} onChange={handleChange('staffRssbNumber')} style={inputStyle} placeholder="RSSB/XXXXXX" />
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
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border-light)' }}>
        <button type="button" onClick={onCancel} disabled={saving} style={{ padding: '9px 22px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto' }}>Cancel</button>
        <button type="submit" disabled={saving} style={{ padding: '9px 22px', fontSize: '0.85rem', fontWeight: 600, color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : staff ? 'Update Staff' : 'Add Staff'}</button>
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

const inputStyle = {
  width: '100%', minHeight: 40, padding: '8px 12px',
  fontSize: '0.85rem', border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)', background: '#fff',
  color: 'var(--color-text-heading)', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
};

// ─── Main Page ──────────────────────────────────────────────
export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchStaff = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await listStaff({ page, limit: 20, search: debouncedSearch });
      setStaff(result.data || []);
      setPagination(result.pagination || { page, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchStaff(1); }, [fetchStaff]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createStaff(data);
      toast.success('Staff member created!');
      setShowForm(false);
      fetchStaff(1);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create staff');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await updateStaff(editingStaff.staff_id, data);
      toast.success('Staff updated!');
      setEditingStaff(null);
      fetchStaff(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update staff');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteStaff(deleting.staff_id);
      toast.success('Staff removed');
      setDeleting(null);
      fetchStaff(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete staff');
    } finally { setSaving(false); }
  };

  const goToPage = (p) => { if (p >= 1 && p <= pagination.totalPages) fetchStaff(p); };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>Staff</h1>
          {!loading && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{pagination.total} staff member{pagination.total !== 1 ? 's' : ''}</p>}
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 12px rgba(26, 86, 219, 0.3)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Staff
        </button>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 16px', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-light)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: 'var(--color-text-light)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, staff number, or phone..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--color-text-heading)', background: 'transparent', minHeight: 'auto', padding: 0 }} />
        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)', padding: 4, display: 'flex', minHeight: 'auto' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border-light)' }}>
                <Th>Staff No</Th>
                <Th>Full Name</Th>
                <Th>Gender</Th>
                <Th>Category</Th>
                <Th>Position</Th>
                <Th>Phone</Th>
                <Th>Contract</Th>
                <Th>Status</Th>
                <Th style={{ textAlign: 'right' }}>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} style={{ padding: '14px 16px' }}>
                      <div style={{ height: 14, background: 'var(--color-border)', borderRadius: 4, width: j === 1 ? '60%' : j === 6 ? '30%' : '80%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    </td>
                  ))}</tr>
                ))
              ) : staff.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-light)' }}>{debouncedSearch ? 'No staff match your search' : 'No staff yet'}</td></tr>
              ) : (
                staff.map((s) => (
                  <tr key={s.staff_id} style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-heading)', fontWeight: 600 }}>{s.staff_no || '—'}</span></Td>
                    <Td><span style={{ fontWeight: 500, color: 'var(--color-text-heading)' }}>{s.full_name || '—'}</span></Td>
                    <Td><span style={{ color: s.gender === 'F' ? '#DC2626' : '#2563EB', fontWeight: 500 }}>{s.gender === 'F' ? 'Female' : s.gender === 'M' ? 'Male' : '—'}</span></Td>
                    <Td>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: categoryColors[s.staff_category] || '#64748B' }}>
                        {s.staff_category || '—'}
                      </span>
                    </Td>
                    <Td><span style={{ color: 'var(--color-text)', fontSize: '0.82rem' }}>{s.staff_position || '—'}</span></Td>
                    <Td><span style={{ color: 'var(--color-text)' }}>{s.phone_number || '—'}</span></Td>
                    <Td><span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#6B7280' }}>{s.contract_type || '—'}</span></Td>
                    <Td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, color: '#fff', background: statusColors[s.status] || '#64748B' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
                        {statusLabels[s.status] || s.status || 'Unknown'}
                      </span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <ActionBtn title="Edit" onClick={() => setEditingStaff(s)} color="#2563EB">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </ActionBtn>
                        <ActionBtn title="Delete" onClick={() => setDeleting(s)} color="#DC2626">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '14px 16px', borderTop: '1px solid var(--color-border-light)', background: 'var(--color-bg)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <PageBtn disabled={pagination.page <= 1} onClick={() => goToPage(pagination.page - 1)}>Previous</PageBtn>
              {renderPageNumbers(pagination, goToPage)}
              <PageBtn disabled={pagination.page >= pagination.totalPages} onClick={() => goToPage(pagination.page + 1)}>Next</PageBtn>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showForm && (
        <Modal title="Add Staff Member" onClose={() => setShowForm(false)}>
          <StaffForm onSave={handleCreate} onCancel={() => setShowForm(false)} saving={saving} />
        </Modal>
      )}

      {/* Edit Modal */}
      {editingStaff && (
        <Modal title="Edit Staff Member" onClose={() => setEditingStaff(null)}>
          <StaffForm
            staff={{
              fullName: editingStaff.full_name || '',
              gender: editingStaff.gender || 'M',
              maritalStatus: editingStaff.marital_status || '',
              nationality: editingStaff.nationality ?? 'Rwandan',
              idPassportNo: editingStaff.id_passport_no || '',
              staffCategory: editingStaff.staff_category || '',
              phoneNumber: editingStaff.phone_number || '',
              email: editingStaff.email || '',
              dateOfBirth: editingStaff.date_of_birth ? editingStaff.date_of_birth.split('T')[0] : '',
              highestQualification: editingStaff.highest_qualification || '',
              domain: editingStaff.domain || '',
              subDomain: editingStaff.sub_domain || '',
              fieldOfStudy: editingStaff.field_of_study || '',
              graduationDate: editingStaff.graduation_date ? editingStaff.graduation_date.split('T')[0] : '',
              staffPosition: editingStaff.staff_position || '',
              employmentDateEducation: editingStaff.employment_date_education ? editingStaff.employment_date_education.split('T')[0] : '',
              employmentDateSchool: editingStaff.employment_date_school ? editingStaff.employment_date_school.split('T')[0] : '',
              contractType: editingStaff.contract_type || '',
              staffBank: editingStaff.staff_bank || '',
              accountNumber: editingStaff.account_number || '',
              staffRssbNumber: editingStaff.staff_rssb_number || '',
              province: editingStaff.province || '',
              district: editingStaff.district || '',
              sector: editingStaff.sector || '',
              cell: editingStaff.cell || '',
              village: editingStaff.village || '',
              detailAddress: editingStaff.detail_address || '',
              status: editingStaff.status || 'active',
            }}
            onSave={handleUpdate}
            onCancel={() => setEditingStaff(null)}
            saving={saving}
          />
        </Modal>
      )}

      {/* Delete Modal */}
      {deleting && (
        <ConfirmDialog
          message={`Are you sure you want to remove "${deleting.full_name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={saving}
        />
      )}

      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────
function Th({ children, style, ...props }) {
  return <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap', ...style }} {...props}>{children}</th>;
}

function Td({ children }) {
  return <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{children}</td>;
}

function ActionBtn({ children, onClick, title, color }) {
  return (
    <button title={title} onClick={onClick}
      style={{ width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: `${color}0a`, border: `1px solid ${color}20`, borderRadius: 8, cursor: 'pointer', color, minHeight: 'auto', transition: 'all 0.15s' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${color}18`; e.currentTarget.style.borderColor = `${color}40`; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = `${color}0a`; e.currentTarget.style.borderColor = `${color}20`; }}
    >{children}</button>
  );
}

function PageBtn({ children, active, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: active ? 600 : 500, color: active ? '#fff' : 'var(--color-text)', background: active ? 'var(--color-primary)' : 'transparent', border: active ? 'none' : '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: disabled ? 'default' : 'pointer', minHeight: 'auto', opacity: disabled ? 0.4 : 1 }}
    >{children}</button>
  );
}

function renderPageNumbers(pagination, goToPage) {
  const { page, totalPages } = pagination;
  const pages = [];
  const maxVisible = 7;
  let start, end;
  if (totalPages <= maxVisible) {
    start = 1; end = totalPages;
  } else if (page <= 4) {
    start = 1; end = maxVisible;
  } else if (page >= totalPages - 3) {
    start = totalPages - 6; end = totalPages;
  } else {
    start = page - 3; end = page + 3;
  }
  for (let i = start; i <= end; i++) {
    pages.push(<PageBtn key={i} active={i === page} onClick={() => goToPage(i)}>{i}</PageBtn>);
  }
  return pages;
}
