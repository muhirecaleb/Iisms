import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Pencil, Trash2, Key, Search, X, Check, Shield, Eye, EyeOff,
} from 'lucide-react';
import {
  listUsers, getUser, createUser, updateUser, deleteUser, listRoles, resetPassword,
} from '../../services/users.service';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// ─── Helpers ─────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const statusColors = {
  active: { bg: '#F0FDF4', text: '#166534', label: 'Active' },
  inactive: { bg: '#F9FAFB', text: '#6B7280', label: 'Inactive' },
  locked: { bg: '#FEF2F2', text: '#B91C1C', label: 'Locked' },
};

const roleColors = {
  Administrator: '#DC2626',
  Director: '#7C3AED',
  DOS: '#2563EB',
  Registrar: '#059669',
  Teacher: '#D97316',
  Accountant: '#0891B2',
  Cashier: '#65A30D',
  'HR Officer': '#E11D48',
  Librarian: '#4F46E5',
};

// ─── Modal ──────────────────────────────────────────────────
function Modal({ title, children, onClose, wide }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: wide ? 600 : 520, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--color-border-light)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)', padding: 4, display: 'flex', minHeight: 'auto' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── User Form ──────────────────────────────────────────────
function UserForm({ user, roles, onSave, onCancel, saving }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    username: user?.username || '',
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    roleId: user?.role_id || '',
    status: user?.status || 'active',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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
      case 'username':
        if (!value) error = 'Username is required';
        else if (value.length < 3) error = 'At least 3 characters';
        else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = 'Only letters, numbers, underscore';
        break;
      case 'fullName':
        if (!value) error = 'Full name is required';
        else if (value.length < 2) error = 'At least 2 characters';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'roleId':
        if (!value) error = 'Role is required';
        break;
      case 'password':
        if (!isEdit && !value) error = 'Password is required';
        else if (value && value.length < 6) error = 'At least 6 characters';
        break;
      case 'confirmPassword':
        if (value && value !== form.password) error = 'Passwords do not match';
        break;
    }
    setErrors((p) => ({ ...p, [field]: error }));
    return error;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fields = { username: true, fullName: true, email: true, roleId: true };
    if (!isEdit) fields.password = true;
    setTouched(fields);

    let hasError = false;
    for (const field of Object.keys(fields)) {
      if (validateField(field, form[field])) hasError = true;
    }

    if (hasError) { toast.error('Please fix the errors below'); return; }

    onSave({
      username: form.username,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || null,
      roleId: Number(form.roleId),
      status: form.status,
      ...(form.password ? { password: form.password } : {}),
    });
  };

  const fieldStyle = (field) => touched[field] && errors[field]
    ? { ...inputStyle, borderColor: '#DC2626' }
    : inputStyle;

  return (
    <Modal title={isEdit ? 'Edit User' : 'Create User'} onClose={onCancel} wide>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Username <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input type="text" value={form.username} onChange={handleChange('username')} onBlur={handleBlur('username')} style={fieldStyle('username')} placeholder="e.g. john_doe" disabled={isEdit} autoFocus={!isEdit} />
            {touched.username && errors.username && <div style={errorStyle}>{errors.username}</div>}
          </div>
          <div>
            <label style={labelStyle}>Full Name <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input type="text" value={form.fullName} onChange={handleChange('fullName')} onBlur={handleBlur('fullName')} style={fieldStyle('fullName')} placeholder="e.g. John Doe" />
            {touched.fullName && errors.fullName && <div style={errorStyle}>{errors.fullName}</div>}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Email <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <input type="email" value={form.email} onChange={handleChange('email')} onBlur={handleBlur('email')} style={fieldStyle('email')} placeholder="e.g. john@intango.rw" />
            {touched.email && errors.email && <div style={errorStyle}>{errors.email}</div>}
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input type="text" value={form.phone} onChange={handleChange('phone')} style={inputStyle} placeholder="e.g. +250788123456" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Role <span style={{ color: 'var(--color-error)' }}>*</span></label>
            <select value={form.roleId} onChange={handleChange('roleId')} onBlur={handleBlur('roleId')} style={fieldStyle('roleId')}>
              <option value="">Select role...</option>
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
              ))}
            </select>
            {touched.roleId && errors.roleId && <div style={errorStyle}>{errors.roleId}</div>}
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={handleChange('status')} style={inputStyle}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="locked">Locked</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Password {isEdit ? '' : <span style={{ color: 'var(--color-error)' }}>*</span>}</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange('password')} onBlur={handleBlur('password')} style={{ ...fieldStyle('password'), paddingRight: 36 }} placeholder={isEdit ? 'Leave blank to keep current' : 'Min 6 characters'} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)', padding: 2, display: 'flex', minHeight: 'auto' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {touched.password && errors.password && <div style={errorStyle}>{errors.password}</div>}
          </div>
          <div>
            <label style={labelStyle}>Confirm Password</label>
            <input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange('confirmPassword')} onBlur={handleBlur('confirmPassword')} style={fieldStyle('confirmPassword')} placeholder="Confirm password" />
            {touched.confirmPassword && errors.confirmPassword && <div style={errorStyle}>{errors.confirmPassword}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--color-border-light)' }}>
          <button type="button" onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...submitBtnStyle, opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            {saving ? 'Saving...' : <><Check size={16} /> {isEdit ? 'Update User' : 'Create User'}</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Reset Password Modal ───────────────────────────────────
function ResetPasswordModal({ user, onReset, onClose, saving }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password || password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    onReset(user.user_id, password);
  };

  return (
    <Modal title={`Reset Password — ${user.full_name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ padding: '12px 16px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{user.full_name}</div>
          <div style={{ color: 'var(--color-text-light)', fontSize: '0.8rem' }}>@{user.username} · {user.email}</div>
        </div>
        <div>
          <label style={labelStyle}>New Password <span style={{ color: 'var(--color-error)' }}>*</span></label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} placeholder="Min 6 characters" autoFocus />
        </div>
        <div>
          <label style={labelStyle}>Confirm Password <span style={{ color: 'var(--color-error)' }}>*</span></label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} placeholder="Confirm password" />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...submitBtnStyle, background: '#D97706', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            {saving ? 'Resetting...' : <><Key size={16} /> Reset Password</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const { canPerform } = useAuth();
  const canCreate = canPerform('users', 'create');
  const canEdit = canPerform('users', 'edit');
  const canDelete = canPerform('users', 'delete');

  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const result = await listUsers(params);
      setUsers(Array.isArray(result) ? result : (result?.data || []));
      setPagination(result?.pagination || { page, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);
  useEffect(() => { listRoles().then(setRoles).catch(() => {}); }, []);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await updateUser(editing.user_id, data);
        toast.success('User updated');
      } else {
        await createUser(data);
        toast.success('User created');
      }
      setEditing(null);
      setShowForm(false);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleting.user_id);
      toast.success('User deleted');
      setDeleting(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete');
    }
  };

  const handleResetPassword = async (userId, password) => {
    setSaving(true);
    try {
      await resetPassword(userId, password);
      toast.success('Password reset successfully');
      setResetting(null);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setSaving(false);
    }
  };

  const goToPage = (p) => { if (p >= 1 && p <= pagination.totalPages) fetchUsers(p); };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Users size={24} color="var(--color-primary)" />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>User Management</h1>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Manage system users, roles, and access</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} color="var(--color-text-light)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search name, username, or email..." style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 140 }}>
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 120 }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="locked">Locked</option>
        </select>
        {canCreate && (
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600, color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 2px 8px rgba(26,86,219,0.2)' }}>
          <UserPlus size={14} /> Add User
        </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border-light)' }}>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Last Login</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} style={{ padding: '14px 16px' }}><div style={{ height: 14, background: 'var(--color-border)', borderRadius: 4, width: '70%', animation: 'pulse 1.5s ease-in-out infinite' }} /></td>
                  ))}</tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-light)' }}>No users found</td></tr>
              ) : (
                users.map((user) => {
                  const sc = statusColors[user.status] || statusColors.active;
                  const rc = roleColors[user.role_name] || '#6B7280';
                  return (
                    <tr key={user.user_id} style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${rc}14`, color: rc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                            {user.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--color-text-heading)' }}>{user.full_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, color: rc, background: `${rc}10` }}>
                          <Shield size={11} /> {user.role_name}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600, color: sc.text, background: sc.bg }}>{sc.label}</span>
                      </td>
                      <td style={tdStyle}><span style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>{user.email}</span></td>
                      <td style={tdStyle}><span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{formatDate(user.last_login_at)}</span></td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {canEdit && <button onClick={() => setEditing(user)} title="Edit" style={{ padding: '4px 8px', fontSize: '0.72rem', fontWeight: 500, color: '#2563EB', background: 'rgba(37,99,235,0.08)', border: 'none', borderRadius: 4, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}><Pencil size={12} /> Edit</button>}
                          <button onClick={() => setResetting(user)} title="Reset Password" style={{ padding: '4px 8px', fontSize: '0.72rem', fontWeight: 500, color: '#D97706', background: 'rgba(217,119,6,0.08)', border: 'none', borderRadius: 4, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}><Key size={12} /> Reset</button>
                          {canDelete && <button onClick={() => setDeleting(user)} title="Delete" style={{ padding: '4px 8px', fontSize: '0.72rem', fontWeight: 500, color: '#DC2626', background: 'rgba(220,38,38,0.06)', border: 'none', borderRadius: 4, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}><Trash2 size={12} /> Del</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--color-border-light)', background: 'var(--color-bg)', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
            <span>Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page <= 1} style={pageBtnStyle(pagination.page <= 1)}>Prev</button>
              <button onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} style={pageBtnStyle(pagination.page >= pagination.totalPages)}>Next</button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>

      {showForm && <UserForm roles={roles} onSave={handleSave} onCancel={() => setShowForm(false)} saving={saving} />}
      {editing && <UserForm user={editing} roles={roles} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />}
      {resetting && <ResetPasswordModal user={resetting} onReset={handleResetPassword} onClose={() => setResetting(null)} saving={saving} />}
      {deleting && (
        <Modal title="Delete User" onClose={() => setDeleting(null)}>
          <p style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>Are you sure you want to delete this user?</p>
          <div style={{ padding: '12px 16px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
            <div style={{ fontWeight: 600, color: 'var(--color-text-heading)' }}>{deleting.full_name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>@{deleting.username} · {deleting.email}</div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleting(null)} style={cancelBtnStyle}>Cancel</button>
            <button onClick={handleDelete} style={{ ...submitBtnStyle, background: '#DC2626', display: 'flex', alignItems: 'center', gap: 6 }}><Trash2 size={14} /> Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const inputStyle = { width: '100%', minHeight: 38, padding: '7px 12px', fontSize: '0.85rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff', color: 'var(--color-text-heading)', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-heading)', marginBottom: 6 };
const errorStyle = { color: '#DC2626', fontSize: '0.76rem', marginTop: 3 };
const thStyle = { padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.78rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' };
const tdStyle = { padding: '12px 16px', whiteSpace: 'nowrap' };
const cancelBtnStyle = { padding: '8px 16px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto' };
const submitBtnStyle = { padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#fff', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', minHeight: 'auto' };
const pageBtnStyle = (disabled) => ({ padding: '5px 12px', fontSize: '0.8rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1, minHeight: 'auto' });
