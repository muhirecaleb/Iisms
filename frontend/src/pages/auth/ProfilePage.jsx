import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/auth.service';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordErrors, setPasswordErrors] = useState({});

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.charAt(0).toUpperCase() || 'U';

  const roleBadgeColor = user?.role === 'Administrator' ? 'var(--color-primary)'
    : user?.role === 'Staff' ? '#7C3AED'
    : '#2563EB';

  const avatarUrl = user?.avatarUrl || null;

  // ─── Avatar Upload ───────────────────────────────────────
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Profile photo updated!');
      // Force re-fetch user data
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  // ─── Save Name ────────────────────────────────────────────
  const handleSaveName = async () => {
    if (!fullName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/profile', { fullName: fullName.trim() });
      toast.success('Name updated!');
      setEditing(false);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  // ─── Change Password ──────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordErrors({});

    const errors = {};
    if (!currentPassword) errors.current = 'Current password is required';
    if (!newPassword) errors.new = 'New password is required';
    else if (newPassword.length < 8) errors.new = 'Password must be at least 8 characters';
    if (newPassword !== confirmPassword) errors.confirm = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setChanging(true);
    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to change password';
      toast.error(msg);
      if (msg.toLowerCase().includes('current password')) {
        setPasswordErrors({ current: msg });
      }
    } finally {
      setChanging(false);
    }
  };

  const toggleShow = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const fieldStyle = (hasError) => ({
    width: '100%',
    minHeight: 44,
    padding: '10px 40px 10px 14px',
    fontSize: '0.9rem',
    border: `1.5px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-sm)',
    background: '#fff',
    color: 'var(--color-text-heading)',
    outline: 'none',
    transition: 'border-color 0.2s',
  });

  const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--color-text-heading)',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>
          My Profile
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
          Manage your profile, photo, and security
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ─── Profile Card ───────────────────────────────────── */}
        <div style={{
          background: '#fff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-light)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: 100,
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
            position: 'relative',
          }}>
            {/* Avatar */}
            <div style={{
              position: 'absolute',
              bottom: -40,
              left: 32,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.5rem',
              border: '4px solid #fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
            }}
              onClick={handleAvatarClick}
              title="Change photo"
            >
              {avatarUrl ? (
                <img src={`http://localhost:4000${avatarUrl.replace(/\\/g, '/')}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
              {/* Hover overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#fff',
              }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
              >
                {uploading ? '...' : 'Edit'}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          <div style={{ padding: '48px 32px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                {editing ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        ...fieldStyle(false),
                        maxWidth: 280,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        padding: '8px 14px',
                        minHeight: 42,
                      }}
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setEditing(false); setFullName(user?.fullName || ''); } }}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={saving}
                      style={{
                        padding: '8px 18px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#fff',
                        background: 'var(--color-primary)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        minHeight: 'auto',
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setFullName(user?.fullName || ''); }}
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: 'var(--color-text)',
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        minHeight: 'auto',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div>
                      <h2 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>
                        {user?.fullName || user?.username}
                      </h2>
                      <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                        @{user?.username}
                      </p>
                    </div>
                    <button
                      onClick={() => { setEditing(true); setFullName(user?.fullName || ''); }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: 'var(--color-primary)',
                        background: 'rgba(26, 86, 219, 0.08)',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        minHeight: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#fff',
                    background: roleBadgeColor,
                    borderRadius: 6,
                    padding: '3px 10px',
                  }}>
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 20,
              marginTop: 24,
              paddingTop: 24,
              borderTop: '1px solid var(--color-border-light)',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Email</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-heading)', fontWeight: 500 }}>{user?.email || '—'}</div>
              </div>
              {user?.lastLoginAt && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Last Login</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-heading)', fontWeight: 500 }}>
                    {new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Permissions</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-heading)', fontWeight: 500 }}>
                  {user?.permissions?.length || 0} module{(user?.permissions?.length || 0) !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Change Password Card ──────────────────────────── */}
        <div style={{
          background: '#fff',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-light)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 32px',
            borderBottom: '1px solid var(--color-border-light)',
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>
              Change Password
            </h3>
          </div>

          <form onSubmit={handlePasswordChange} style={{ padding: '24px 32px 32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 420 }}>
              {['current', 'new', 'confirm'].map((field) => (
                <div key={field}>
                  <label style={labelStyle}>
                    {field === 'current' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm New Password'}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPasswords[field] ? 'text' : 'password'}
                      value={
                        field === 'current' ? currentPassword
                        : field === 'new' ? newPassword
                        : confirmPassword
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (field === 'current') setCurrentPassword(val);
                        else if (field === 'new') setNewPassword(val);
                        else setConfirmPassword(val);
                      }}
                      placeholder={field === 'new' ? 'At least 8 characters' : `Enter ${field === 'current' ? 'current' : 'new'} password`}
                      autoComplete={field === 'current' ? 'current-password' : 'new-password'}
                      style={fieldStyle(!!passwordErrors[field])}
                      onFocus={(e) => { if (!passwordErrors[field]) e.target.style.borderColor = 'var(--color-primary)'; }}
                      onBlur={(e) => { if (!passwordErrors[field]) e.target.style.borderColor = 'var(--color-border)'; }}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow(field)}
                      style={{
                        position: 'absolute', right: 10, background: 'none', border: 'none',
                        cursor: 'pointer', color: 'var(--color-text-light)', padding: 6,
                        display: 'flex', minHeight: 'auto',
                      }}
                      aria-label={showPasswords[field] ? 'Hide password' : 'Show password'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {showPasswords[field]
                          ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                        }
                      </svg>
                    </button>
                  </div>
                  {passwordErrors[field] && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-error)' }}>{passwordErrors[field]}</p>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
                <button
                  type="submit"
                  disabled={changing}
                  style={{
                    padding: '10px 28px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#fff',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    opacity: changing ? 0.7 : 1,
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(26, 86, 219, 0.3)',
                  }}
                >
                  {changing ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordErrors({});
                  }}
                  style={{
                    padding: '10px 20px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: 'var(--color-text)',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    minHeight: 'auto',
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
