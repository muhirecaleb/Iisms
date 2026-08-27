import { useState, useEffect, useCallback } from 'react';
import {
  listAcademicYears,
  createAcademicYear,
  setCurrentYear,
  deleteAcademicYear,
} from '../../services/academicYears.service';
import toast from 'react-hot-toast';

// ─── Helpers ─────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: 480, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
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

// ─── Main Page ──────────────────────────────────────────────
export default function AcademicYearsPage() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchYears = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAcademicYears();
      setYears(data || []);
    } catch (err) {
      toast.error('Failed to load academic years');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchYears(); }, [fetchYears]);

  const handleSetCurrent = async (year) => {
    try {
      await setCurrentYear(year.year_id);
      toast.success(`${year.year_label} is now the current year`);
      fetchYears();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAcademicYear(deleting.year_id);
      toast.success('Academic year deleted');
      setDeleting(null);
      fetchYears();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>Academic Years</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Manage academic years and set the current active year</p>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
          {loading ? 'Loading...' : `${years.length} year(s) configured`}
        </p>
        <button onClick={() => setShowForm(true)} style={addBtnStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Academic Year
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border-light)' }}>
                <th style={thStyle}>Year Label</th>
                <th style={thStyle}>Start Date</th>
                <th style={thStyle}>End Date</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} style={{ padding: '14px 16px' }}><div style={{ height: 14, background: 'var(--color-border)', borderRadius: 4, width: '70%', animation: 'pulse 1.5s ease-in-out infinite' }} /></td>
                  ))}</tr>
                ))
              ) : years.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 12 }}>&#x1F4C5;</div>
                    <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--color-text-heading)' }}>No academic years configured</p>
                    <p style={{ margin: 0, fontSize: '0.82rem' }}>Click "Add Academic Year" to create one.</p>
                  </td>
                </tr>
              ) : (
                years.map((year) => (
                  <tr key={year.year_id} style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background 0.15s', background: year.is_current ? 'rgba(5,150,105,0.03)' : 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = year.is_current ? 'rgba(5,150,105,0.03)' : 'transparent'}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{year.year_label}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: 'var(--color-text)' }}>{formatDate(year.start_date)}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: 'var(--color-text)' }}>{formatDate(year.end_date)}</span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {year.is_current ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 12px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600, color: '#fff', background: '#059669' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
                          Current
                        </span>
                      ) : (
                        <span style={{ padding: '3px 12px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 500, color: 'var(--color-text-light)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {!year.is_current && (
                          <button onClick={() => handleSetCurrent(year)} style={{ padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600, color: '#059669', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 6, cursor: 'pointer', minHeight: 'auto' }}>
                            Set Current
                          </button>
                        )}
                        {!year.is_current && (
                          <button onClick={() => setDeleting(year)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600, color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 6, cursor: 'pointer', minHeight: 'auto' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <CreateYearForm onClose={() => setShowForm(false)} onDone={() => { setShowForm(false); fetchYears(); }} />}
      {deleting && (
        <Modal title="Delete Academic Year" onClose={() => setDeleting(null)}>
          <p style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>Are you sure you want to delete this academic year?</p>
          <div style={{ padding: '10px 14px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', marginBottom: 20, fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{deleting.year_label}</div>
            <div style={{ color: 'var(--color-text-light)', fontSize: '0.8rem' }}>{formatDate(deleting.start_date)} — {formatDate(deleting.end_date)}</div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleting(null)} style={cancelBtnStyle}>Cancel</button>
            <button onClick={handleDelete} style={{ ...submitBtnStyle, background: '#DC2626' }}>Delete</button>
          </div>
        </Modal>
      )}

      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}

// ─── Create Form ────────────────────────────────────────────
function CreateYearForm({ onClose, onDone }) {
  const [form, setForm] = useState({ yearLabel: '', startDate: '', endDate: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((p) => ({ ...p, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const handleBlur = (field) => () => {
    setTouched((p) => ({ ...p, [field]: true }));
    validateField(field, form[field]);
  };

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'yearLabel':
        if (!value) error = 'Year label is required';
        else if (!/^\d{4}(-\d{4})?$/.test(value)) error = 'Format: 2026 or 2025-2026';
        break;
      case 'startDate':
        if (value && form.endDate && new Date(value) >= new Date(form.endDate)) {
          error = 'Start date must be before end date';
        }
        break;
      case 'endDate':
        if (value && form.startDate && new Date(value) <= new Date(form.startDate)) {
          error = 'End date must be after start date';
        }
        break;
    }
    setErrors((p) => ({ ...p, [field]: error }));
    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { yearLabel: true, startDate: true, endDate: true };
    setTouched(allTouched);

    const allErrors = {};
    for (const field of Object.keys(allTouched)) {
      const err = validateField(field, form[field]);
      if (err) allErrors[field] = err;
    }

    if (!form.yearLabel) allErrors.yearLabel = 'Year label is required';

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      toast.error('Please fix the errors below');
      return;
    }

    setSaving(true);
    try {
      await createAcademicYear({
        yearLabel: form.yearLabel,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      });
      toast.success('Academic year created!');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const fieldErrorStyle = (field) => touched[field] && errors[field]
    ? { ...inputStyle, borderColor: '#DC2626' }
    : inputStyle;

  return (
    <Modal title="Add Academic Year" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Year Label <span style={{ color: 'var(--color-error)' }}>*</span></label>
          <input type="text" value={form.yearLabel} onChange={handleChange('yearLabel')} onBlur={handleBlur('yearLabel')} style={fieldErrorStyle('yearLabel')} placeholder="e.g. 2026 or 2025-2026" autoFocus />
          {touched.yearLabel && errors.yearLabel && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 4 }}>{errors.yearLabel}</div>}
        </div>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input type="date" value={form.startDate} onChange={handleChange('startDate')} onBlur={handleBlur('startDate')} style={fieldErrorStyle('startDate')} />
          {touched.startDate && errors.startDate && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 4 }}>{errors.startDate}</div>}
        </div>
        <div>
          <label style={labelStyle}>End Date</label>
          <input type="date" value={form.endDate} onChange={handleChange('endDate')} onBlur={handleBlur('endDate')} style={fieldErrorStyle('endDate')} />
          {touched.endDate && errors.endDate && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 4 }}>{errors.endDate}</div>}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...submitBtnStyle, opacity: saving ? 0.7 : 1 }}>{saving ? 'Creating...' : 'Create Year'}</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const inputStyle = { width: '100%', minHeight: 40, padding: '8px 12px', fontSize: '0.85rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--color-text-heading)', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-heading)', marginBottom: 6 };
const thStyle = { padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' };
const tdStyle = { padding: '12px 16px', whiteSpace: 'nowrap' };
const addBtnStyle = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600, color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 2px 8px rgba(26,86,219,0.2)' };
const cancelBtnStyle = { padding: '9px 18px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto' };
const submitBtnStyle = { padding: '9px 18px', fontSize: '0.85rem', fontWeight: 600, color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto' };
