import React, { useState, useEffect, useCallback } from 'react';
import { BookMarked } from 'lucide-react';
import {
  listBooks, createBook, updateBook, deleteBook, getBookCategories,
  borrowBook, returnBook, listTransactions, getOverdueTransactions,
  getLibraryDashboard, searchBorrower, seedLibraryData,
} from '../../services/library.service';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ─── Helpers ─────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'books', label: 'Books' },
  { id: 'transactions', label: 'Borrow/Return' },
  { id: 'overdue', label: 'Overdue' },
];

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
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: 600, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
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

// ─── Shared Components ──────────────────────────────────────
function Th({ children, style, ...props }) {
  return <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap', ...style }} {...props}>{children}</th>;
}
function Td({ children, style }) { return <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', ...style }}>{children}</td>; }
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
function StatCard({ label, value, color, loading }) {
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', padding: '20px 24px' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: color || 'var(--color-text-heading)' }}>{loading ? '—' : value}</div>
    </div>
  );
}

const inputStyle = { width: '100%', minHeight: 40, padding: '8px 12px', fontSize: '0.85rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--color-text-heading)', outline: 'none', boxSizing: 'border-box' };
const addBtnStyle = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600, color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 2px 8px rgba(26,86,219,0.2)' };
const cancelBtnStyle = { padding: '9px 18px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto' };
const submitBtnStyle = { padding: '9px 18px', fontSize: '0.85rem', fontWeight: 600, color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto' };

const categoryColors = {
  'Textbook': '#2563EB', 'Reference': '#7C3AED', 'Fiction': '#059669', 'Non-Fiction': '#D97706',
  'Science': '#0891B2', 'Technology': '#6366F1', 'Literature': '#DC2626', 'History': '#EA580C',
  'Mathematics': '#059669', 'General': '#64748B',
};

// ─── Overview Tab ───────────────────────────────────────────
function OverviewTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overdue, setOverdue] = useState([]);

  useEffect(() => {
    getLibraryDashboard().then(setData).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false));
    getOverdueTransactions().then(setOverdue).catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Books" value={data?.totalBooks || 0} color="#2563EB" loading={loading} />
        <StatCard label="Total Copies" value={data?.totalCopies || 0} color="#7C3AED" loading={loading} />
        <StatCard label="Available" value={data?.availableCopies || 0} color="#059669" loading={loading} />
        <StatCard label="Active Borrows" value={data?.activeBorrows || 0} color="#D97706" loading={loading} />
        <StatCard label="Overdue" value={data?.overdue || 0} color="#DC2626" loading={loading} />
      </div>

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
          {/* Most Borrowed Books + Category Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Most Borrowed */}
            <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>Most Borrowed Books</h3>
              {data?.topBooks?.length > 0 ? (
                data.topBooks.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < data.topBooks.length - 1 ? '1px solid var(--color-border-light)' : 'none' }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-heading)' }}>{b.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>{b.author}</div>
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary)' }}>{b.borrow_count} borrows</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>No borrow data yet</div>
              )}
            </div>

            {/* Overdue Books */}
            {overdue.length > 0 && (
              <div style={{ background: '#FEF2F2', borderRadius: 'var(--radius-md)', border: '1px solid rgba(220,38,38,0.2)', padding: 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 600, color: '#DC2626' }}>⚠️ Overdue Books ({overdue.length})</h3>
                {overdue.slice(0, 5).map((t) => (
                  <div key={t.transaction_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(220,38,38,0.1)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-heading)', fontWeight: 500 }}>{t.book_title}</span>
                    <span style={{ color: 'var(--color-text-light)' }}>{t.borrower_name} — {t.days_overdue}d overdue</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Activity */}
            {data?.recentTransactions?.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', padding: 24 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>Recent Activity</h3>
                {data.recentTransactions.map((tx) => (
                  <div key={tx.transaction_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--color-border-light)', fontSize: '0.85rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: tx.status === 'returned' ? '#059669' : tx.status === 'borrowed' ? '#D97706' : '#64748B', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 500, color: 'var(--color-text-heading)' }}>{tx.borrower_name || 'Unknown'}</span>
                      <span style={{ color: 'var(--color-text-light)' }}> {tx.status === 'returned' ? 'returned' : 'borrowed'} </span>
                      <span style={{ fontWeight: 500, color: 'var(--color-text-heading)' }}>{tx.book_title}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{formatDate(tx.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Collection Progress (Availability) */}
            <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>Book Availability</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                {/* Circular chart */}
                <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#059669" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${((data?.availableCopies || 0) / (data?.totalCopies || 1)) * 314} ${314 - ((data?.availableCopies || 0) / (data?.totalCopies || 1)) * 314}`}
                      strokeDashoffset="78.5" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>{data?.totalCopies ? Math.round(((data.availableCopies || 0) / data.totalCopies) * 100) : 0}%</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>available</span>
                  </div>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {[
                    { label: 'Available', value: data?.availableCopies || 0, color: '#059669' },
                    { label: 'Borrowed', value: (data?.totalCopies || 0) - (data?.availableCopies || 0) - (data?.overdue || 0), color: '#D97706' },
                    { label: 'Overdue', value: data?.overdue || 0, color: '#DC2626' },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text)', flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ background: 'var(--color-bg)', borderRadius: 8, height: 10, overflow: 'hidden', display: 'flex', marginTop: 20 }}>
                <div style={{ width: `${((data?.availableCopies || 0) / (data?.totalCopies || 1)) * 100}%`, background: '#059669', transition: 'width 0.6s ease' }} />
                <div style={{ width: `${(((data?.totalCopies || 0) - (data?.availableCopies || 0) - (data?.overdue || 0)) / (data?.totalCopies || 1)) * 100}%`, background: '#D97706', transition: 'width 0.6s ease' }} />
                <div style={{ width: `${((data?.overdue || 0) / (data?.totalCopies || 1)) * 100}%`, background: '#DC2626', transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                <span>{data?.availableCopies || 0} available</span>
                <span>{data?.totalCopies || 0} total copies</span>
              </div>
            </div>

            {/* Category Breakdown */}
            {data?.categoryBreakdown?.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', padding: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>Books by Category</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {data.categoryBreakdown.map((cat) => (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{cat.category}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>({cat.book_count} titles, {cat.total_copies} copies)</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{cat.available_copies} avail</span>
                      </div>
                      <div style={{ background: 'var(--color-bg)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 4, width: `${(cat.total_copies / (data.totalCopies || 1)) * 100}%`, background: `linear-gradient(90deg, ${categoryColors[cat.category] || '#64748B'}, ${categoryColors[cat.category] || '#64748B'}99)`, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Borrower Types + Quick Stats */}
            <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>Quick Stats</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Total Transactions', value: data?.totalTransactions || 0, color: '#2563EB' },
                  { label: 'Books Returned', value: data?.returned || 0, color: '#059669' },
                  ...(data?.borrowerBreakdown || []).map(b => ({
                    label: `${b.borrower_type === 'student' ? 'Student' : 'Staff'} Borrows`,
                    value: b.count,
                    color: b.borrower_type === 'student' ? '#6366F1' : '#D97706',
                  })),
                  { label: 'Utilization Rate', value: `${data?.totalCopies ? Math.round(((data.totalCopies - data.availableCopies) / data.totalCopies) * 100) : 0}%`, color: '#7C3AED' },
                ].map((stat) => (
                  <div key={stat.label} style={{ padding: '12px 14px', background: 'var(--color-bg)', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{stat.label}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Books Tab ──────────────────────────────────────────────
function BooksTab() {
  const { canPerform } = useAuth();
  const canCreate = canPerform('library', 'create');
  const canEdit = canPerform('library', 'edit');
  const canDelete = canPerform('library', 'delete');

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedLibraryData();
      toast.success(result?.message || 'Demo books seeded!');
      fetchBooks(1);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to seed data');
    } finally { setSeeding(false); }
  };

  const fetchBooks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const data = await listBooks(params);
      setBooks(Array.isArray(data) ? data : []);
      if (data.pagination) setPagination(data.pagination);
    } catch {
      toast.error('Failed to load books');
    } finally { setLoading(false); }
  }, [search, categoryFilter]);

  useEffect(() => { fetchBooks(1); }, [fetchBooks]);
  useEffect(() => { getBookCategories().then(setCategories).catch(() => {}); }, []);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editing && editing.book_id) {
        await updateBook(editing.book_id, data);
        toast.success('Book updated!');
      } else {
        await createBook(data);
        toast.success('Book added!');
      }
      setShowForm(false);
      setEditing(null);
      fetchBooks(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save book');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteBook(deleting.book_id);
      toast.success('Book deleted');
      setDeleting(null);
      fetchBooks(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete book');
    } finally { setSaving(false); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>Book Catalog</h3>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-light)' }}>{pagination.total} book{pagination.total !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {canCreate && (
            <button onClick={handleSeed} disabled={seeding} style={{ ...addBtnStyle, background: '#7C3AED', opacity: seeding ? 0.7 : 1 }}>
              {seeding ? 'Seeding...' : 'Seed Demo Data'}
            </button>
          )}
          {canCreate && (
            <button onClick={() => { setEditing(null); setShowForm(true); }} style={addBtnStyle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Book
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-light)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-light)', flexShrink: 0 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, author, or ISBN..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.85rem', background: 'transparent', color: 'var(--color-text-heading)', minHeight: 'auto', padding: 0 }} />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 150 }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border-light)' }}>
                <Th>Book</Th>
                <Th>Author</Th>
                <Th>ISBN</Th>
                <Th>Category</Th>
                <Th style={{ textAlign: 'center' }}>Copies</Th>
                <Th style={{ textAlign: 'center' }}>Available</Th>
                <Th>Location</Th>
                <Th style={{ textAlign: 'right' }}>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} style={{ padding: '14px 16px' }}><div style={{ height: 14, background: 'var(--color-border)', borderRadius: 4, width: j === 0 ? '80%' : '60%', animation: 'pulse 1.5s ease-in-out infinite' }} /></td>
                  ))}</tr>
                ))
              ) : books.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-light)' }}>{search ? 'No books match your search' : 'No books in catalog'}</td></tr>
              ) : (
                books.map((b) => (
                  <tr key={b.book_id} style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Td>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-heading)', fontSize: '0.88rem' }}>{b.title}</span>
                        {b.publisher && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{b.publisher}{b.publication_year ? `, ${b.publication_year}` : ''}</div>}
                      </div>
                    </Td>
                    <Td><span style={{ color: 'var(--color-text)' }}>{b.author}</span></Td>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{b.isbn || '—'}</span></Td>
                    <Td>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, color: categoryColors[b.category] || '#64748B', background: `${categoryColors[b.category] || '#64748B'}14` }}>{b.category}</span>
                    </Td>
                    <Td style={{ textAlign: 'center' }}><span style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{b.total_copies}</span></Td>
                    <Td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: b.available_copies > 0 ? '#059669' : '#DC2626' }}>{b.available_copies}</span>
                    </Td>
                    <Td><span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>{b.location || '—'}</span></Td>
                    <Td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {canEdit && <button onClick={() => { setEditing(b); setShowForm(true); }} style={{ padding: '4px 12px', fontSize: '0.78rem', fontWeight: 500, color: '#2563EB', background: 'rgba(37,99,235,0.08)', border: 'none', borderRadius: 6, cursor: 'pointer', minHeight: 'auto' }}>Edit</button>}
                        {canDelete && <button onClick={() => setDeleting(b)} style={{ padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600, color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 6, cursor: 'pointer', minHeight: 'auto' }}>Delete</button>}
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button disabled={pagination.page <= 1} onClick={() => fetchBooks(pagination.page - 1)} style={{ ...cancelBtnStyle, opacity: pagination.page <= 1 ? 0.5 : 1, padding: '6px 14px', fontSize: '0.8rem' }}>Previous</button>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>Page {pagination.page} of {pagination.totalPages}</span>
          <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchBooks(pagination.page + 1)} style={{ ...cancelBtnStyle, opacity: pagination.page >= pagination.totalPages ? 0.5 : 1, padding: '6px 14px', fontSize: '0.8rem' }}>Next</button>
        </div>
      )}

      {showForm && <BookForm book={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} saving={saving} />}

      {deleting && (
        <Modal title="Delete Book" onClose={() => setDeleting(null)}>
          <p style={{ margin: '0 0 12px', fontSize: '0.9rem' }}>Are you sure you want to delete this book?</p>
          <div style={{ padding: '10px 14px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
            <div style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{deleting.title}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>{deleting.author}</div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleting(null)} style={cancelBtnStyle}>Cancel</button>
            <button onClick={handleDelete} disabled={saving} style={{ ...submitBtnStyle, background: '#DC2626', opacity: saving ? 0.7 : 1 }}>{saving ? 'Deleting...' : 'Delete'}</button>
          </div>
        </Modal>
      )}
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}

// ─── Book Form ──────────────────────────────────────────────
function BookForm({ book, onSave, onCancel, saving }) {
  const isEdit = !!book?.book_id;
  const [form, setForm] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    publisher: book?.publisher || '',
    publicationYear: book?.publication_year || '',
    category: book?.category || '',
    totalCopies: book?.total_copies || 1,
    location: book?.location || '',
    description: book?.description || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.author.trim()) e.author = 'Author is required';
    if (!form.category.trim()) e.category = 'Category is required';
    if (form.totalCopies < 1) e.totalCopies = 'At least 1 copy';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...form,
      totalCopies: Number(form.totalCopies) || 1,
      publicationYear: form.publicationYear ? Number(form.publicationYear) : null,
    });
  };

  const FieldStyle = (hasError) => ({
    ...inputStyle,
    borderColor: hasError ? 'var(--color-error)' : 'var(--color-border)',
  });

  return (
    <Modal title={isEdit ? 'Edit Book' : 'Add Book'} onClose={onCancel}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Title" required>
          <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} style={FieldStyle(errors.title)} placeholder="Book title" autoFocus />
          {errors.title && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: 4, display: 'block' }}>{errors.title}</span>}
        </Field>
        <Field label="Author" required>
          <input type="text" value={form.author} onChange={(e) => setForm(p => ({ ...p, author: e.target.value }))} style={FieldStyle(errors.author)} placeholder="Author name" />
          {errors.author && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: 4, display: 'block' }}>{errors.author}</span>}
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="ISBN">
            <input type="text" value={form.isbn} onChange={(e) => setForm(p => ({ ...p, isbn: e.target.value }))} style={inputStyle} placeholder="978-..." />
          </Field>
          <Field label="Category" required>
            <input type="text" value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} style={FieldStyle(errors.category)} placeholder="e.g. Textbook, Reference" list="categories-list" />
            <datalist id="categories-list">
              {['Textbook', 'Reference', 'Fiction', 'Non-Fiction', 'Science', 'Technology', 'Literature', 'History', 'Mathematics', 'General'].map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {errors.category && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: 4, display: 'block' }}>{errors.category}</span>}
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Field label="Publisher">
            <input type="text" value={form.publisher} onChange={(e) => setForm(p => ({ ...p, publisher: e.target.value }))} style={inputStyle} placeholder="Publisher name" />
          </Field>
          <Field label="Year">
            <input type="number" value={form.publicationYear} onChange={(e) => setForm(p => ({ ...p, publicationYear: e.target.value }))} style={inputStyle} placeholder="2024" min="1900" max="2100" />
          </Field>
          <Field label="Copies" required>
            <input type="number" value={form.totalCopies} onChange={(e) => setForm(p => ({ ...p, totalCopies: e.target.value }))} style={FieldStyle(errors.totalCopies)} min="1" />
            {errors.totalCopies && <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: 4, display: 'block' }}>{errors.totalCopies}</span>}
          </Field>
        </div>
        <Field label="Location">
          <input type="text" value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} style={inputStyle} placeholder="e.g. Shelf A3, Section B" />
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Optional description" />
        </Field>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...submitBtnStyle, opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : isEdit ? 'Update Book' : 'Add Book'}</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Borrow/Return Tab ──────────────────────────────────────
function TransactionsTab() {
  const { canPerform } = useAuth();
  const canCreate = canPerform('library', 'create');
  const canEdit = canPerform('library', 'edit');

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [showBorrow, setShowBorrow] = useState(false);
  const [returning, setReturning] = useState(null);

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await listTransactions(params);
      setTransactions(Array.isArray(data) ? data : []);
      if (data.pagination) setPagination(data.pagination);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchTransactions(1); }, [fetchTransactions]);

  const handleReturn = async (tx) => {
    try {
      await returnBook(tx.transaction_id);
      toast.success('Book returned successfully!');
      setReturning(null);
      fetchTransactions(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to return book');
    }
  };

  const statusColors = {
    borrowed: { bg: '#FFF7ED', text: '#C2410C', label: 'Borrowed' },
    returned: { bg: '#F0FDF4', text: '#166534', label: 'Returned' },
    overdue: { bg: '#FEF2F2', text: '#DC2626', label: 'Overdue' },
    lost: { bg: '#F9FAFB', text: '#6B7280', label: 'Lost' },
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>Borrowing History</h3>
        {canCreate && (
          <button onClick={() => setShowBorrow(true)} style={addBtnStyle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Issue Book
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-light)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-light)', flexShrink: 0 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by book title, borrower name, or admission no..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.85rem', background: 'transparent', color: 'var(--color-text-heading)', minHeight: 'auto', padding: 0 }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 140 }}>
          <option value="">All Status</option>
          <option value="borrowed">Borrowed</option>
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border-light)' }}>
                <Th>Book</Th>
                <Th>Borrower</Th>
                <Th>Type</Th>
                <Th>Borrowed</Th>
                <Th>Due</Th>
                <Th>Returned</Th>
                <Th>Status</Th>
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
              ) : transactions.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-light)' }}>No transactions found</td></tr>
              ) : (
                transactions.map((tx) => {
                  const isOverdue = tx.status === 'borrowed' && new Date(tx.due_date) < new Date();
                  const sc = statusColors[isOverdue ? 'overdue' : tx.status] || statusColors.borrowed;
                  return (
                    <tr key={tx.transaction_id} style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <Td>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{tx.book_title}</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{tx.book_author}</div>
                        </div>
                      </Td>
                      <Td>
                        <div>
                          <span style={{ fontWeight: 500, color: 'var(--color-text-heading)' }}>{tx.borrower_name || '—'}</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{tx.borrower_no || ''} {tx.borrower_detail ? `• ${tx.borrower_detail}` : ''}</div>
                        </div>
                      </Td>
                      <Td><span style={{ fontSize: '0.78rem', fontWeight: 500, color: tx.borrower_type === 'student' ? '#2563EB' : '#059669', textTransform: 'capitalize' }}>{tx.borrower_type}</span></Td>
                      <Td><span style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>{formatDate(tx.borrow_date)}</span></Td>
                      <Td><span style={{ fontSize: '0.82rem', color: isOverdue ? '#DC2626' : 'var(--color-text)', fontWeight: isOverdue ? 600 : 400 }}>{formatDate(tx.due_date)}</span></Td>
                      <Td><span style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>{tx.return_date ? formatDate(tx.return_date) : '—'}</span></Td>
                      <Td>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, color: sc.text, background: sc.bg }}>
                          {isOverdue ? 'Overdue' : sc.label}
                        </span>
                      </Td>
                      <Td style={{ textAlign: 'right' }}>
                        {canEdit && tx.status === 'borrowed' && (
                          <button onClick={() => setReturning(tx)} style={{ padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600, color: '#fff', background: '#059669', border: 'none', borderRadius: 6, cursor: 'pointer', minHeight: 'auto' }}>
                            Return
                          </button>
                        )}
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button disabled={pagination.page <= 1} onClick={() => fetchTransactions(pagination.page - 1)} style={{ ...cancelBtnStyle, opacity: pagination.page <= 1 ? 0.5 : 1, padding: '6px 14px', fontSize: '0.8rem' }}>Previous</button>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>Page {pagination.page} of {pagination.totalPages}</span>
          <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchTransactions(pagination.page + 1)} style={{ ...cancelBtnStyle, opacity: pagination.page >= pagination.totalPages ? 0.5 : 1, padding: '6px 14px', fontSize: '0.8rem' }}>Next</button>
        </div>
      )}

      {showBorrow && <BorrowForm onClose={() => setShowBorrow(false)} onDone={() => { setShowBorrow(false); fetchTransactions(1); }} />}
      {returning && (
        <Modal title="Return Book" onClose={() => setReturning(null)}>
          <p style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>Return this book?</p>
          <div style={{ padding: '10px 14px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
            <div style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{returning.book_title}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>Borrowed by: {returning.borrower_name} — Due: {formatDate(returning.due_date)}</div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={() => setReturning(null)} style={cancelBtnStyle}>Cancel</button>
            <button onClick={() => handleReturn(returning)} style={{ ...submitBtnStyle, background: '#059669' }}>Confirm Return</button>
          </div>
        </Modal>
      )}
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}

// ─── Borrow Form ────────────────────────────────────────────
function BorrowForm({ onClose, onDone }) {
  const [bookQuery, setBookQuery] = useState('');
  const [bookResults, setBookResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowerType, setBorrowerType] = useState('student');
  const [borrowerQuery, setBorrowerQuery] = useState('');
  const [borrowerResults, setBorrowerResults] = useState([]);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchingBook, setSearchingBook] = useState(false);
  const [searchingBorrower, setSearchingBorrower] = useState(false);

  // Search books
  useEffect(() => {
    if (!bookQuery || bookQuery.length < 2) { setBookResults([]); return; }
    const t = setTimeout(() => {
      setSearchingBook(true);
      listBooks({ search: bookQuery, limit: 10 }).then(data => {
        setBookResults(Array.isArray(data) ? data : []);
      }).catch(() => setBookResults([])).finally(() => setSearchingBook(false));
    }, 300);
    return () => clearTimeout(t);
  }, [bookQuery]);

  // Search borrowers
  useEffect(() => {
    if (!borrowerQuery || borrowerQuery.length < 2) { setBorrowerResults([]); return; }
    const t = setTimeout(() => {
      setSearchingBorrower(true);
      searchBorrower({ q: borrowerQuery, type: borrowerType }).then(setBorrowerResults).catch(() => setBorrowerResults([])).finally(() => setSearchingBorrower(false));
    }, 300);
    return () => clearTimeout(t);
  }, [borrowerQuery, borrowerType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBook || !selectedBorrower || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      await borrowBook({
        bookId: selectedBook.book_id,
        borrowerType,
        borrowerId: selectedBorrower.id,
        dueDate,
        notes,
      });
      toast.success('Book issued successfully!');
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to issue book');
    } finally { setSaving(false); }
  };

  return (
    <Modal title="Issue Book" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Book search */}
        <Field label="Search Book" required>
          {selectedBook ? (
            <div style={{ padding: '10px 14px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-heading)', fontSize: '0.88rem' }}>{selectedBook.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>{selectedBook.author} • {selectedBook.available_copies} available</div>
              </div>
              <button type="button" onClick={() => setSelectedBook(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.78rem', fontWeight: 600 }}>Change</button>
            </div>
          ) : (
            <>
              <input type="text" value={bookQuery} onChange={(e) => setBookQuery(e.target.value)} style={inputStyle} placeholder="Type book title or author..." autoFocus />
              {bookResults.length > 0 && (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                  {bookResults.map((b) => (
                    <div key={b.book_id} onClick={() => { setSelectedBook(b); setBookQuery(''); setBookResults([]); }}
                      style={{ padding: '10px 12px', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{b.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{b.author} • {b.category}</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: b.available_copies > 0 ? '#059669' : '#DC2626', fontWeight: 600 }}>{b.available_copies} avail</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Field>

        {/* Borrower type */}
        <Field label="Borrower Type">
          <div style={{ display: 'flex', gap: 8 }}>
            {['student', 'staff'].map(t => (
              <button key={t} type="button" onClick={() => { setBorrowerType(t); setSelectedBorrower(null); setBorrowerQuery(''); }}
                style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 500, borderRadius: 8, border: '1px solid', borderColor: borrowerType === t ? 'var(--color-primary)' : 'var(--color-border)', background: borrowerType === t ? 'rgba(26,86,219,0.06)' : '#fff', color: borrowerType === t ? 'var(--color-primary)' : 'var(--color-text)', cursor: 'pointer', minHeight: 'auto', textTransform: 'capitalize' }}>
                {t}
              </button>
            ))}
          </div>
        </Field>

        {/* Borrower search */}
        <Field label={`Search ${borrowerType === 'student' ? 'Student' : 'Staff'}`} required>
          {selectedBorrower ? (
            <div style={{ padding: '10px 14px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{selectedBorrower.first_name} {selectedBorrower.last_name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>{selectedBorrower.code} {selectedBorrower.detail ? `• ${selectedBorrower.detail}` : ''}</div>
              </div>
              <button type="button" onClick={() => setSelectedBorrower(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.78rem', fontWeight: 600 }}>Change</button>
            </div>
          ) : (
            <>
              <input type="text" value={borrowerQuery} onChange={(e) => setBorrowerQuery(e.target.value)} style={inputStyle} placeholder={`Type ${borrowerType} name or ID...`} />
              {borrowerResults.length > 0 && (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                  {borrowerResults.map((b) => (
                    <div key={b.id} onClick={() => { setSelectedBorrower(b); setBorrowerQuery(''); setBorrowerResults([]); }}
                      style={{ padding: '10px 12px', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--color-border-light)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ fontWeight: 500 }}>{b.first_name} {b.last_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{b.code} {b.detail ? `• ${b.detail}` : ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Field>

        <Field label="Due Date" required>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} min={new Date().toISOString().split('T')[0]} />
        </Field>

        <Field label="Notes">
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} style={inputStyle} placeholder="Optional notes" />
        </Field>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...submitBtnStyle, opacity: saving ? 0.7 : 1 }}>{saving ? 'Issuing...' : 'Issue Book'}</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Overdue Tab ────────────────────────────────────────────
function OverdueTab() {
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverdueTransactions().then(setOverdue).catch(() => toast.error('Failed to load overdue')).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>
        Overdue Books {overdue.length > 0 && <span style={{ color: '#DC2626' }}>({overdue.length})</span>}
      </h3>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-light)' }}>Loading...</div>
      ) : overdue.length === 0 ? (
        <div style={{ background: '#F0FDF4', borderRadius: 'var(--radius-md)', border: '1px solid rgba(5,150,105,0.2)', padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 600, color: '#059669', fontSize: '1rem' }}>No overdue books!</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: 4 }}>All borrowed books are within their due dates.</div>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#FEF2F2', borderBottom: '1px solid rgba(220,38,38,0.2)' }}>
                <Th>Book</Th>
                <Th>Borrower</Th>
                <Th>Type</Th>
                <Th>Borrowed</Th>
                <Th>Due Date</Th>
                <Th style={{ textAlign: 'center' }}>Days Overdue</Th>
              </tr>
            </thead>
            <tbody>
              {overdue.map((tx) => (
                <tr key={tx.transaction_id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <Td><span style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{tx.book_title}</span></Td>
                  <Td><span style={{ fontWeight: 500, color: 'var(--color-text-heading)' }}>{tx.borrower_name || '—'}</span></Td>
                  <Td><span style={{ fontSize: '0.78rem', textTransform: 'capitalize', color: 'var(--color-text)' }}>{tx.borrower_type}</span></Td>
                  <Td><span style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>{formatDate(tx.borrow_date)}</span></Td>
                  <Td><span style={{ fontSize: '0.82rem', color: '#DC2626', fontWeight: 600 }}>{formatDate(tx.due_date)}</span></Td>
                  <Td style={{ textAlign: 'center' }}><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', background: '#FEF2F2' }}>{tx.days_overdue} days</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <BookMarked size={24} color="var(--color-primary)" />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>Library</h1>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Manage book catalog, borrowing, and returns</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--color-border-light)', paddingBottom: 0 }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: '10px 18px', fontSize: '0.85rem', fontWeight: activeTab === tab.id ? 600 : 500, color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text)', background: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer', marginBottom: -1, minHeight: 'auto', transition: 'all 0.15s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'books' && <BooksTab />}
      {activeTab === 'transactions' && <TransactionsTab />}
      {activeTab === 'overdue' && <OverdueTab />}
    </div>
  );
}
