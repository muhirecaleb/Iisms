import React, { useState, useEffect, useCallback } from 'react';
import {
  getFinanceDashboard,
  getFeeStructure,
  upsertFeeRate,
  listFeeItems,
  listInvoices,
  generateInvoices,
  getInvoiceDetail,
  recordPayment,
  listSponsorships,
  upsertSponsorship,
  deleteSponsorship,
  searchStudents,
  seedFinanceData,
  listAcademicYears,
  listTerms,
} from '../../services/finance.service';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// ─── Helpers ─────────────────────────────────────────────────
const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-RW', {
    style: 'currency', currency: 'RWF',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const statusColors = {
  open: '#D97706',
  partially_paid: '#2563EB',
  paid: '#059669',
  void: '#64748B',
};

const statusLabels = {
  open: 'Open',
  partially_paid: 'Partial',
  paid: 'Paid',
  void: 'Void',
};

const methodColors = {
  'Cash': '#059669',
  'Mobile Money': '#7C3AED',
  'Bank Transfer': '#2563EB',
  'Cheque': '#D97706',
  'Other': '#64748B',
};

// ─── Modal ──────────────────────────────────────────────────
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
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-md)',
        width: '100%', maxWidth: wide ? 680 : 520, maxHeight: '85vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--color-border-light)',
        }}>
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

// ─── Stat Card ──────────────────────────────────────────────
function StatCard({ label, value, subtitle, color, loading }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-md)', padding: 22,
      border: '1px solid var(--color-border-light)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
      {loading ? (
        <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
          <div style={{ width: '50%', height: 28, background: 'var(--color-border)', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ width: '70%', height: 14, background: 'var(--color-border-light)', borderRadius: 4 }} />
        </div>
      ) : (
        <>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-heading)', marginBottom: 4 }}>{value}</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>{label}</div>
          {subtitle && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: 2 }}>{subtitle}</div>}
        </>
      )}
    </div>
  );
}

// ─── Tabs ───────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'fees', label: 'Fee Structure' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'sponsorships', label: 'Sponsorships' },
];

// ─── Overview Tab ───────────────────────────────────────────
function OverviewTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    getFinanceDashboard()
      .then(setData)
      .catch(() => toast.error('Failed to load finance data'))
      .finally(() => setLoading(false));
    listInvoices({ limit: 200 }).then((r) => {
      setInvoices(Array.isArray(r) ? r : (r?.data || []));
    }).catch(() => {});
  }, []);

  const k = data?.kpis || {};

  // Status breakdown
  const statusCounts = invoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {});
  const total = invoices.length || 1;

  // Class breakdown
  const classData = invoices.reduce((acc, inv) => {
    const cls = inv.class_name || 'Unknown';
    if (!acc[cls]) acc[cls] = { count: 0, due: 0, paid: 0 };
    acc[cls].count++;
    acc[cls].due += Number(inv.amount_due || 0);
    if (inv.status === 'paid') acc[cls].paid += Number(inv.amount_due || 0);
    return acc;
  }, {});
  const maxClassDue = Math.max(...Object.values(classData).map((c) => c.due), 1);

  return (
    <div>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 24 }}>
        <StatCard label="Total Students" value={loading ? '—' : k.totalStudents || 0} color="#2563EB" loading={loading} />
        <StatCard label="Total Invoiced" value={loading ? '—' : formatCurrency(k.totalInvoiced)} color="#7C3AED" loading={loading} />
        <StatCard label="Total Collected" value={loading ? '—' : formatCurrency(k.totalCollected)} subtitle={loading ? '' : `Rate: ${k.collectionRate || 0}%`} color="#059669" loading={loading} />
        <StatCard label="Outstanding" value={loading ? '—' : formatCurrency(k.outstanding)} color="#DC2626" loading={loading} />
      </div>

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
          {/* Collection Progress + Status Breakdown */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>Collection Progress</h3>

            {/* Circular Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24 }}>
              <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#progressGradient)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(Number(k.collectionRate) || 0) * 3.14} ${314 - (Number(k.collectionRate) || 0) * 3.14}`}
                    strokeDashoffset="78.5" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                  <defs><linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#059669" /><stop offset="100%" stopColor="#10B981" /></linearGradient></defs>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>{k.collectionRate || 0}%</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>collected</span>
                </div>
              </div>

              {/* Status Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {[
                  { key: 'paid', label: 'Paid', color: '#059669' },
                  { key: 'partially_paid', label: 'Partial', color: '#2563EB' },
                  { key: 'open', label: 'Open', color: '#D97706' },
                  { key: 'void', label: 'Void', color: '#64748B' },
                ].map(({ key, label, color }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text)', flex: 1 }}>{label}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{statusCounts[key] || 0}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', width: 35, textAlign: 'right' }}>{total > 0 ? Math.round(((statusCounts[key] || 0) / total) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Horizontal Progress Bar */}
            <div style={{ background: 'var(--color-bg)', borderRadius: 8, height: 10, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${total > 0 ? ((statusCounts.paid || 0) / total) * 100 : 0}%`, background: '#059669', transition: 'width 0.6s ease' }} />
              <div style={{ width: `${total > 0 ? ((statusCounts.partially_paid || 0) / total) * 100 : 0}%`, background: '#2563EB', transition: 'width 0.6s ease' }} />
              <div style={{ width: `${total > 0 ? ((statusCounts.open || 0) / total) * 100 : 0}%`, background: '#D97706', transition: 'width 0.6s ease' }} />
              <div style={{ width: `${total > 0 ? ((statusCounts.void || 0) / total) * 100 : 0}%`, background: '#64748B', transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
              <span>{formatCurrency(k.totalCollected)} collected</span>
              <span>{formatCurrency(k.totalInvoiced)} total</span>
            </div>
          </div>

          {/* By Class Breakdown */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>Invoices by Class</h3>
            {Object.keys(classData).length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>No invoice data yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(classData).sort(([a], [b]) => a.localeCompare(b)).map(([cls, info]) => (
                  <div key={cls}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{cls}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>({info.count})</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{formatCurrency(info.due)}</span>
                    </div>
                    <div style={{ background: 'var(--color-bg)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 4, width: `${maxClassDue > 0 ? (info.due / maxClassDue) * 100 : 0}%`, background: 'linear-gradient(90deg, #2563EB, #60A5FA)', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Fee Structure Tab ──────────────────────────────────────
function FeeStructureTab() {
  const { canPerform } = useAuth();
  const canEdit = canPerform('finance', 'edit');
  const canCreate = canPerform('finance', 'create');
  const [rates, setRates] = useState([]);
  const [feeItems, setFeeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const [rateData, itemsData] = await Promise.all([
        getFeeStructure(),
        listFeeItems(),
      ]);
      setRates(rateData.rates || []);
      setFeeItems(itemsData || []);
    } catch (err) {
      toast.error('Failed to load fee structure');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedFinanceData();
      toast.success(`Seeded: ${result.data.feeItems} fee items, ${result.data.feeRates} rates, ${result.data.sponsorships} sponsorships`);
      fetchRates();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      await upsertFeeRate(data);
      toast.success('Fee rate saved!');
      setEditing(null);
      fetchRates();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Group rates by level
  const byLevel = {};
  rates.forEach((r) => {
    if (!byLevel[r.level]) byLevel[r.level] = [];
    byLevel[r.level].push(r);
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>Fee Structure</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Fee rates by level and term</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSeed} disabled={seeding} style={{ ...addBtnStyle, background: '#7C3AED', opacity: seeding ? 0.7 : 1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M2 12h20" /></svg>
            {seeding ? 'Seeding...' : 'Seed Demo Data'}
          </button>
          {canCreate && (
          <button onClick={() => setEditing({ level: '', termId: '', feeItemId: '', amount: '' })} style={addBtnStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Rate
          </button>
        )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-light)' }}>Loading...</div>
      ) : Object.keys(byLevel).length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-light)', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>&#x1F4B0;</div>
          <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--color-text-heading)' }}>No fee rates configured yet</p>
          <p style={{ margin: 0, fontSize: '0.82rem' }}>Click <strong>Seed Demo Data</strong> to populate fee items, rates, and sample sponsorships.</p>
        </div>
      ) : (
        Object.entries(byLevel).sort().map(([level, items]) => (
          <div key={level} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 24, borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
                color: '#fff', background: '#2563EB',
              }}>{level}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{level}</span>
            </div>
            <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border-light)' }}>
                    <Th>Term</Th>
                    <Th>Fee Item</Th>
                    <Th style={{ textAlign: 'right' }}>Amount</Th>
                    <Th style={{ textAlign: 'right', width: 60 }}>Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={`${r.level}-${r.term_id}-${r.fee_item_id}`} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <Td><span style={{ fontWeight: 500, color: 'var(--color-text-heading)' }}>{r.term_name}</span></Td>
                      <Td><span style={{ color: 'var(--color-text)' }}>{r.item_name}</span></Td>
                      <Td style={{ textAlign: 'right' }}><span style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{formatCurrency(r.amount)}</span></Td>
                      <Td style={{ textAlign: 'right' }}>
                        {canEdit && <button onClick={() => setEditing({ level: r.level, termId: r.term_id, feeItemId: r.fee_item_id, amount: r.amount })} style={editBtnStyle}>Edit</button>}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {editing && (
        <FeeRateForm rate={editing} feeItems={feeItems} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
      )}
    </div>
  );
}

function FeeRateForm({ rate, feeItems = [], onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    level: rate.level || '',
    termId: rate.termId || '',
    feeItemId: rate.feeItemId || '',
    amount: rate.amount || '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
      case 'level':
        if (!value) error = 'Please select a level';
        break;
      case 'termId':
        if (!value) error = 'Please select a term';
        break;
      case 'feeItemId':
        if (!value) error = 'Please select a fee item';
        break;
      case 'amount':
        if (!value) error = 'Amount is required';
        else if (Number(value) <= 0) error = 'Amount must be greater than 0';
        else if (Number(value) > 10000000) error = 'Amount seems too high';
        break;
    }
    setErrors((p) => ({ ...p, [field]: error }));
    return error;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = { level: true, termId: true, feeItemId: true, amount: true };
    setTouched(allTouched);

    const allErrors = {};
    for (const field of Object.keys(allTouched)) {
      const err = validateField(field, form[field]);
      if (err) allErrors[field] = err;
    }

    if (Object.keys(allErrors).length > 0) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    onSave({
      level: form.level,
      termId: Number(form.termId),
      feeItemId: Number(form.feeItemId),
      amount: Number(form.amount),
    });
  };

  const fieldErrorStyle = (field) => touched[field] && errors[field]
    ? { ...inputStyle, borderColor: '#DC2626' }
    : inputStyle;

  return (
    <Modal title="Add / Edit Fee Rate" onClose={onCancel}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
          Set the fee amount for a specific level, term, and fee type.
        </p>
        <Field label="Level" required>
          <select value={form.level} onChange={handleChange('level')} onBlur={handleBlur('level')} style={fieldErrorStyle('level')}>
            <option value="">Select level...</option>
            <option value="L2">L2</option><option value="L3">L3</option><option value="L4">L4</option>
            <option value="L5">L5</option>
          </select>
          {touched.level && errors.level && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 4 }}>{errors.level}</div>}
        </Field>
        <Field label="Term" required>
          <select value={form.termId} onChange={handleChange('termId')} onBlur={handleBlur('termId')} style={fieldErrorStyle('termId')}>
            <option value="">Select term...</option>
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </select>
          {touched.termId && errors.termId && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 4 }}>{errors.termId}</div>}
        </Field>
        <Field label="Fee Item" required>
          <select value={form.feeItemId} onChange={handleChange('feeItemId')} onBlur={handleBlur('feeItemId')} style={fieldErrorStyle('feeItemId')}>
            <option value="">Select fee item...</option>
            {feeItems.map((item) => (
              <option key={item.fee_item_id} value={item.fee_item_id}>{item.item_name}</option>
            ))}
          </select>
          {touched.feeItemId && errors.feeItemId && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 4 }}>{errors.feeItemId}</div>}
        </Field>
        <Field label="Amount (RWF)" required>
          <input type="number" value={form.amount} onChange={handleChange('amount')} onBlur={handleBlur('amount')} style={fieldErrorStyle('amount')} placeholder="e.g. 85000" min="0" />
          {touched.amount && errors.amount && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginTop: 4 }}>{errors.amount}</div>}
        </Field>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...submitBtnStyle, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save Rate'}</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Invoice Row Component ──────────────────────────────────
function InvoiceRow({ inv, setViewingInvoice, setShowPayment }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background 0.15s' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <Td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>#{inv.invoice_id}</span></Td>
      <Td><span style={{ fontWeight: 500, color: 'var(--color-text-heading)' }}>{inv.first_name} {inv.last_name}</span></Td>
      <Td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{inv.admission_no}</span></Td>
      <Td>{inv.class_name ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: inv.level === 'L5' ? '#7C3AED' : inv.level === 'L4' ? '#2563EB' : inv.level === 'L3' ? '#059669' : inv.level === 'L2' ? '#D97706' : '#64748B' }}>{inv.class_name}</span>
      ) : <span style={{ color: 'var(--color-text-light)', fontSize: '0.8rem' }}>—</span>}</Td>
      <Td><span style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{formatCurrency(inv.amount_due)}</span></Td>
      <Td>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600, color: '#fff', background: statusColors[inv.status] || '#64748B' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
          {statusLabels[inv.status] || inv.status}
        </span>
      </Td>
      <Td><span style={{ color: 'var(--color-text-light)' }}>{formatDate(inv.invoice_date)}</span></Td>
      <Td style={{ textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button onClick={() => setViewingInvoice(inv)} style={viewBtnStyle}>View</button>
          {(inv.status === 'open' || inv.status === 'partially_paid') && (
            <button onClick={() => setShowPayment(inv)} style={payBtnStyle}>Pay</button>
          )}
        </div>
      </Td>
    </tr>
  );
}

// ─── Invoices Tab ───────────────────────────────────────────
function InvoicesTab() {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByClass, setGroupByClass] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showPayment, setShowPayment] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  useEffect(() => {
    listAcademicYears().then((years) => {
      setAcademicYears(years);
      const current = years.find((y) => y.is_current);
      if (current) setYearFilter(String(current.year_id));
    }).catch(() => {});
    listTerms().then(setTerms).catch(() => {});
  }, []);

  const fetchInvoices = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 100 };
      if (statusFilter) params.status = statusFilter;
      if (yearFilter) params.academicYearId = yearFilter;
      if (termFilter) params.termId = termFilter;
      if (searchQuery) params.search = searchQuery;
      const result = await listInvoices(params);
      setInvoices(Array.isArray(result) ? result : (result?.data || []));
      setPagination(result?.pagination || { page, limit: 100, total: 0, totalPages: 0 });
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, yearFilter, termFilter, searchQuery]);

  useEffect(() => { fetchInvoices(1); }, [fetchInvoices]);

  const goToPage = (p) => { if (p >= 1 && p <= pagination.totalPages) fetchInvoices(p); };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>Invoices</h3>
        <button onClick={() => setShowGenerate(true)} style={addBtnStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Generate Invoices
        </button>
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-heading)', whiteSpace: 'nowrap' }}>Year:</label>
        <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setTermFilter(''); }} style={{ ...inputStyle, width: 'auto', minWidth: 140 }}>
          <option value="">All Years</option>
          {academicYears.map((y) => (
            <option key={y.year_id} value={y.year_id}>{y.year_label} {y.is_current ? '(Current)' : ''}</option>
          ))}
        </select>
        <select value={termFilter} onChange={(e) => setTermFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 130 }}>
          <option value="">All Terms</option>
          {terms
            .filter((t) => !yearFilter || String(t.academic_year_id) === String(yearFilter))
            .map((t) => (
              <option key={t.term_id} value={t.term_id}>{t.term_name}</option>
            ))}
        </select>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-light)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search name, admission, or class..." style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
        <button onClick={() => setGroupByClass(!groupByClass)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: '0.82rem', fontWeight: 500, color: groupByClass ? '#fff' : 'var(--color-text)', background: groupByClass ? 'var(--color-primary)' : '#fff', border: groupByClass ? 'none' : '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
          {groupByClass ? 'Ungroup' : 'Group by Class'}
        </button>
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['', 'open', 'partially_paid', 'paid', 'void'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '6px 14px', fontSize: '0.8rem', fontWeight: statusFilter === s ? 600 : 500,
              color: statusFilter === s ? '#fff' : 'var(--color-text)',
              background: statusFilter === s ? 'var(--color-primary)' : '#fff',
              border: statusFilter === s ? 'none' : '1px solid var(--color-border)',
              borderRadius: 20, cursor: 'pointer', minHeight: 'auto',
            }}
          >
            {s ? statusLabels[s] || s : 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border-light)' }}>
                <Th>Invoice #</Th>
                <Th>Student</Th>
                <Th>Admission</Th>
                <Th>Class</Th>
                <Th>Amount Due</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th style={{ textAlign: 'right' }}>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} style={{ padding: '14px 16px' }}><div style={{ height: 14, background: 'var(--color-border)', borderRadius: 4, width: '70%', animation: 'pulse 1.5s ease-in-out infinite' }} /></td>
                  ))}</tr>
                ))
              ) : invoices.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-light)' }}>No invoices found</td></tr>
              ) : groupByClass ? (
                // Grouped view
                Object.entries(
                  invoices.reduce((acc, inv) => {
                    const key = inv.class_name || 'Unassigned';
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(inv);
                    return acc;
                  }, {})
                ).sort(([a], [b]) => a.localeCompare(b)).map(([className, classInvoices]) => {
                  const totalDue = classInvoices.reduce((sum, inv) => sum + Number(inv.amount_due || 0), 0);
                  const paidCount = classInvoices.filter((inv) => inv.status === 'paid').length;
                  return (
                    <React.Fragment key={className}>
                      <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border-light)' }}>
                        <td colSpan={8} style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '2px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: '#2563EB' }}>{className}</span>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{classInvoices.length} student(s)</span>
                            </div>
                            <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                              <span>Total: <strong style={{ color: 'var(--color-text-heading)' }}>{formatCurrency(totalDue)}</strong></span>
                              <span>Paid: <strong style={{ color: '#059669' }}>{paidCount}/{classInvoices.length}</strong></span>
                            </div>
                          </div>
                        </td>
                      </tr>
                      {classInvoices.map((inv) => (
                        <InvoiceRow key={inv.invoice_id} inv={inv} setViewingInvoice={setViewingInvoice} setShowPayment={setShowPayment} />
                      ))}
                    </React.Fragment>
                  );
                })
              ) : (
                // Flat view
                invoices.map((inv) => (
                  <InvoiceRow key={inv.invoice_id} inv={inv} setViewingInvoice={setViewingInvoice} setShowPayment={setShowPayment} />
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--color-border-light)', background: 'var(--color-bg)', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page <= 1} style={pageBtnStyle(pagination.page <= 1)}>Prev</button>
              <button onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} style={pageBtnStyle(pagination.page >= pagination.totalPages)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {showGenerate && <GenerateInvoiceForm onClose={() => setShowGenerate(false)} onDone={() => { setShowGenerate(false); fetchInvoices(1); }} />}
      {showPayment && <RecordPaymentForm invoice={showPayment} onClose={() => setShowPayment(null)} onDone={() => { setShowPayment(null); fetchInvoices(pagination.page); }} />}
      {viewingInvoice && <InvoiceDetailView invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />}
    </div>
  );
}

function GenerateInvoiceForm({ onClose, onDone }) {
  const [form, setForm] = useState({ termId: '', feeItemId: 1 });
  const [feeItems, setFeeItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  useEffect(() => {
    listFeeItems().then(setFeeItems).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.termId) { toast.error('Please select a term'); return; }
    setSaving(true);
    try {
      const result = await generateInvoices({ ...form, termId: Number(form.termId), feeItemId: Number(form.feeItemId) });
      toast.success(`Generated ${result.generated} invoice(s), skipped ${result.skipped}`);
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to generate invoices');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Generate Invoices" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
          Generate invoices for all active students in the current academic year.
        </p>
        <Field label="Term" required>
          <select value={form.termId} onChange={handleChange('termId')} style={inputStyle}>
            <option value="">Select term...</option>
            <option value="1">Term 1</option><option value="2">Term 2</option><option value="3">Term 3</option>
          </select>
        </Field>
        <Field label="Fee Item">
          <select value={form.feeItemId} onChange={handleChange('feeItemId')} style={inputStyle}>
            {feeItems.map((item) => (
              <option key={item.fee_item_id} value={item.fee_item_id}>{item.item_name}</option>
            ))}
          </select>
        </Field>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...submitBtnStyle, opacity: saving ? 0.7 : 1 }}>{saving ? 'Generating...' : 'Generate'}</button>
        </div>
      </form>
    </Modal>
  );
}

function RecordPaymentForm({ invoice, onClose, onDone }) {
  const [form, setForm] = useState({
    invoiceId: invoice.invoice_id,
    studentId: invoice.student_id,
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    referenceNo: '',
    comment: '',
  });
  const [saving, setSaving] = useState(false);
  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Please enter a valid amount'); return; }
    setSaving(true);
    try {
      await recordPayment({ ...form, amount: Number(form.amount) });
      toast.success('Payment recorded!');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Record Payment" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ padding: '12px 16px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{invoice.first_name} {invoice.last_name}</div>
          <div style={{ color: 'var(--color-text-light)', fontSize: '0.8rem' }}>Invoice #{invoice.invoice_id} — Due: {formatCurrency(invoice.amount_due)}</div>
        </div>
        <Field label="Amount (RWF)" required>
          <input type="number" value={form.amount} onChange={handleChange('amount')} style={inputStyle} placeholder={`Max: ${invoice.amount_due}`} max={invoice.amount_due} />
        </Field>
        <Field label="Payment Date" required>
          <input type="date" value={form.paymentDate} onChange={handleChange('paymentDate')} style={inputStyle} />
        </Field>
        <Field label="Payment Method" required>
          <select value={form.paymentMethod} onChange={handleChange('paymentMethod')} style={inputStyle}>
            <option value="Cash">Cash</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
            <option value="Other">Other</option>
          </select>
        </Field>
        <Field label="Reference No">
          <input type="text" value={form.referenceNo} onChange={handleChange('referenceNo')} style={inputStyle} placeholder="Optional" />
        </Field>
        <Field label="Comment">
          <input type="text" value={form.comment} onChange={handleChange('comment')} style={inputStyle} placeholder="Optional note" />
        </Field>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...submitBtnStyle, opacity: saving ? 0.7 : 1 }}>{saving ? 'Recording...' : 'Record Payment'}</button>
        </div>
      </form>
    </Modal>
  );
}

function InvoiceDetailView({ invoice, onClose }) {
  const DetailRow = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-light)' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{label}</span>
      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-heading)', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );

  return (
    <Modal title={`Invoice #${invoice.invoice_id}`} onClose={onClose}>
      <div style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-heading)' }}>{invoice.first_name} {invoice.last_name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{invoice.admission_no}</div>
        </div>
        <DetailRow label="Gross Amount" value={formatCurrency(invoice.gross_amount)} />
        <DetailRow label="Discount" value={invoice.discount_percent > 0 ? `${invoice.discount_percent}%` : '—'} />
        <DetailRow label="Amount Due" value={formatCurrency(invoice.amount_due)} />
        <DetailRow label="Status">
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10,
            fontSize: '0.72rem', fontWeight: 600, color: '#fff', background: statusColors[invoice.status] || '#64748B',
          }}>{statusLabels[invoice.status] || invoice.status}</span>
        </DetailRow>
        <DetailRow label="Invoice Date" value={formatDate(invoice.invoice_date)} />
        <DetailRow label="Created" value={formatDate(invoice.created_at)} />
      </div>
    </Modal>
  );
}

// ─── Sponsorships Tab ───────────────────────────────────────
function SponsorshipsTab() {
  const { canPerform } = useAuth();
  const canCreate = canPerform('finance', 'create');
  const canEdit = canPerform('finance', 'edit');
  const canDelete = canPerform('finance', 'delete');
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchSponsorships = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSponsorships();
      setSponsorships(data || []);
    } catch (err) {
      toast.error('Failed to load sponsorships');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSponsorships(); }, [fetchSponsorships]);

  const handleDelete = async () => {
    try {
      await deleteSponsorship(deleting.sponsorship_id);
      toast.success('Sponsorship removed');
      setDeleting(null);
      fetchSponsorships();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>Sponsorships</h3>
        {canCreate && (
          <button onClick={() => setShowForm(true)} style={addBtnStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Sponsorship
          </button>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border-light)' }}>
                <Th>Student</Th>
                <Th>Admission</Th>
                <Th>Class</Th>
                <Th>Sponsor</Th>
                <Th style={{ textAlign: 'center' }}>Coverage</Th>
                <Th>Notes</Th>
                <Th style={{ textAlign: 'right' }}>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (                    Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} style={{ padding: '14px 16px' }}><div style={{ height: 14, background: 'var(--color-border)', borderRadius: 4, width: '70%', animation: 'pulse 1.5s ease-in-out infinite' }} /></td>
                  ))}</tr>
                ))
              ) : sponsorships.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-light)' }}>No sponsorships configured</td></tr>
              ) : (
                sponsorships.map((sp) => (
                  <tr key={sp.sponsorship_id} style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Td><span style={{ fontWeight: 500, color: 'var(--color-text-heading)' }}>{sp.first_name} {sp.last_name}</span></Td>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{sp.admission_no}</span></Td>
                    <Td><span style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>{sp.class_name || '—'}</span></Td>
                    <Td><span style={{ color: 'var(--color-text)' }}>{sp.sponsor_name}</span></Td>
                    <Td style={{ textAlign: 'center' }}><span style={{ fontWeight: 700, color: '#7C3AED' }}>{sp.coverage_percent}%</span></Td>
                    <Td><span style={{ color: 'var(--color-text-light)', fontSize: '0.82rem' }}>{sp.notes || '—'}</span></Td>
                    <Td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {canEdit && <button onClick={() => setEditing(sp)} style={{ padding: '4px 12px', fontSize: '0.78rem', fontWeight: 500, color: '#2563EB', background: 'rgba(37,99,235,0.08)', border: 'none', borderRadius: 6, cursor: 'pointer', minHeight: 'auto' }}>Edit</button>}
                        {canDelete && <button onClick={() => setDeleting(sp)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600, color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 6, cursor: 'pointer', minHeight: 'auto' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>
                          Delete
                        </button>}
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <SponsorshipForm onClose={() => setShowForm(false)} onDone={() => { setShowForm(false); fetchSponsorships(); }} />}
      {editing && <SponsorshipForm sponsorship={editing} onClose={() => setEditing(null)} onDone={() => { setEditing(null); fetchSponsorships(); }} />}
      {deleting && (
        <Modal title="Delete Sponsorship" onClose={() => setDeleting(null)}>
          <p style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>Are you sure you want to delete this sponsorship?</p>
          <div style={{ padding: '10px 14px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', marginBottom: 20, fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{deleting.first_name} {deleting.last_name}</div>
            <div style={{ color: 'var(--color-text-light)', fontSize: '0.8rem' }}>{deleting.sponsor_name} — {deleting.coverage_percent}% coverage</div>
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

function SponsorshipForm({ sponsorship, onClose, onDone }) {
  const isEdit = !!sponsorship;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(isEdit ? { student_id: sponsorship.student_id, first_name: sponsorship.first_name, last_name: sponsorship.last_name, admission_no: sponsorship.admission_no, class_name: sponsorship.class_name, gender: sponsorship.gender } : null);
  const [form, setForm] = useState({
    sponsorName: isEdit ? sponsorship.sponsor_name : '',
    coveragePercent: isEdit ? sponsorship.coverage_percent : '',
    notes: isEdit ? (sponsorship.notes || '') : '',
  });
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      setSearching(true);
      searchStudents(query).then((data) => setResults(Array.isArray(data) ? data : [])).catch(() => setResults([])).finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = (s) => { setSelected(s); setQuery(''); setResults([]); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected || !form.sponsorName || !form.coveragePercent) { toast.error('Please fill in all required fields'); return; }
    setSaving(true);
    try {
      await upsertSponsorship({
        studentId: selected.student_id,
        sponsorName: form.sponsorName,
        coveragePercent: Number(form.coveragePercent),
        notes: form.notes,
      });
      toast.success('Sponsorship saved!');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Sponsorship' : 'Add Sponsorship'} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!selected ? (
          <Field label="Search Student" required>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} style={inputStyle} placeholder="Type name or admission number..." autoFocus />
            {results.length > 0 && (
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', maxHeight: 220, overflowY: 'auto', marginTop: 4 }}>
                {results.map((s) => (
                  <div key={s.student_id} onClick={() => handleSelect(s)} style={{ padding: '10px 12px', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{s.admission_no}</span>
                        {s.class_name && <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500 }}>{s.class_name}</span>}
                        {s.gender && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>({s.gender})</span>}
                      </div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, color: '#fff', background: s.level === 'L5' ? '#7C3AED' : s.level === 'L4' ? '#2563EB' : s.level === 'L3' ? '#059669' : s.level === 'L2' ? '#D97706' : '#64748B' }}>{s.level || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </Field>
        ) : (
          <div style={{ padding: '12px 14px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                {selected.first_name?.[0]}{selected.last_name?.[0]}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{selected.first_name} {selected.last_name}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.75rem' }}>
                  <span style={{ fontFamily: 'monospace', color: 'var(--color-text-light)' }}>{selected.admission_no}</span>
                  {selected.class_name && <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>{selected.class_name}</span>}
                  {selected.gender && <span style={{ color: 'var(--color-text-light)' }}>({selected.gender})</span>}
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.78rem', fontWeight: 600 }}>Change</button>
          </div>
        )}
        <Field label="Sponsor Name" required>
          <input type="text" value={form.sponsorName} onChange={(e) => setForm((p) => ({ ...p, sponsorName: e.target.value }))} style={inputStyle} placeholder="e.g. Church Germany" />
        </Field>
        <Field label="Coverage %" required>
          <input type="number" value={form.coveragePercent} onChange={(e) => setForm((p) => ({ ...p, coveragePercent: e.target.value }))} style={inputStyle} placeholder="e.g. 90" min="0" max="100" />
        </Field>
        <Field label="Notes">
          <input type="text" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} style={inputStyle} placeholder="Optional" />
        </Field>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...submitBtnStyle, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : isEdit ? 'Update Sponsorship' : 'Save Sponsorship'}</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>Finance</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Manage fees, invoices, payments, and sponsorships</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--color-border-light)', paddingBottom: 0 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px', fontSize: '0.85rem', fontWeight: activeTab === tab.id ? 600 : 500,
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text)',
              background: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer', marginBottom: -1, minHeight: 'auto', transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'fees' && <FeeStructureTab />}
      {activeTab === 'invoices' && <InvoicesTab />}
      {activeTab === 'sponsorships' && <SponsorshipsTab />}

      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}

// ─── Shared Styles ──────────────────────────────────────────
function Th({ children, style, ...props }) {
  return <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap', ...style }} {...props}>{children}</th>;
}
function Td({ children }) { return <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{children}</td>; }
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

const inputStyle = { width: '100%', minHeight: 40, padding: '8px 12px', fontSize: '0.85rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--color-text-heading)', outline: 'none', boxSizing: 'border-box' };
const addBtnStyle = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600, color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 2px 8px rgba(26,86,219,0.2)' };
const editBtnStyle = { padding: '4px 12px', fontSize: '0.78rem', fontWeight: 500, color: '#2563EB', background: 'rgba(37,99,235,0.08)', border: 'none', borderRadius: 6, cursor: 'pointer', minHeight: 'auto' };
const viewBtnStyle = { padding: '5px 12px', fontSize: '0.78rem', fontWeight: 600, color: '#059669', background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 6, cursor: 'pointer', minHeight: 'auto' };
const payBtnStyle = { padding: '5px 12px', fontSize: '0.78rem', fontWeight: 600, color: '#fff', background: '#7C3AED', border: 'none', borderRadius: 6, cursor: 'pointer', minHeight: 'auto' };
const cancelBtnStyle = { padding: '9px 18px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto' };
const submitBtnStyle = { padding: '9px 18px', fontSize: '0.85rem', fontWeight: 600, color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto' };
const pageBtnStyle = (disabled) => ({ padding: '5px 12px', fontSize: '0.8rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1, minHeight: 'auto' });
