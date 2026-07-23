import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/auth.service';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [activeTab, setActiveTab] = useState('security');

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.charAt(0).toUpperCase() || 'U';

  const tabs = [
    { id: 'security', label: 'Security', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    )},
    { id: 'account', label: 'Account', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    )},
    { id: 'preferences', label: 'Preferences', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )},
  ];

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
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>
          Settings
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
          Manage your account, security, and preferences
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Left sidebar with tabs */}
        <div style={{
          width: 220,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === tab.id ? 'rgba(26, 86, 219, 0.08)' : 'transparent',
                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                minHeight: 'auto',
                transition: 'all 0.15s',
                borderLeft: activeTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
              }}
            >
              <span style={{ opacity: activeTab === tab.id ? 1 : 0.5 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Security Tab */}
          {activeTab === 'security' && (
            <div style={{
              background: '#fff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-light)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '20px 32px',
                borderBottom: '1px solid var(--color-border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(26, 86, 219, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-primary)',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>
                    Change Password
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    Update your account password regularly for security
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} style={{ padding: '24px 32px 32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 420 }}>
                  <div>
                    <label style={labelStyle}>Current Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                        style={fieldStyle(!!passwordErrors.current)}
                        onFocus={(e) => { if (!passwordErrors.current) e.target.style.borderColor = 'var(--color-primary)'; }}
                        onBlur={(e) => { if (!passwordErrors.current) e.target.style.borderColor = 'var(--color-border)'; }}
                      />
                      <ToggleButton show={showPasswords.current} onClick={() => toggleShow('current')} />
                    </div>
                    {passwordErrors.current && <FieldError msg={passwordErrors.current} />}
                  </div>

                  <div>
                    <label style={labelStyle}>New Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        style={fieldStyle(!!passwordErrors.new)}
                        onFocus={(e) => { if (!passwordErrors.new) e.target.style.borderColor = 'var(--color-primary)'; }}
                        onBlur={(e) => { if (!passwordErrors.new) e.target.style.borderColor = 'var(--color-border)'; }}
                      />
                      <ToggleButton show={showPasswords.new} onClick={() => toggleShow('new')} />
                    </div>
                    {passwordErrors.new && <FieldError msg={passwordErrors.new} />}
                  </div>

                  <div>
                    <label style={labelStyle}>Confirm New Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                        style={fieldStyle(!!passwordErrors.confirm)}
                        onFocus={(e) => { if (!passwordErrors.confirm) e.target.style.borderColor = 'var(--color-primary)'; }}
                        onBlur={(e) => { if (!passwordErrors.confirm) e.target.style.borderColor = 'var(--color-border)'; }}
                      />
                      <ToggleButton show={showPasswords.confirm} onClick={() => toggleShow('confirm')} />
                    </div>
                    {passwordErrors.confirm && <FieldError msg={passwordErrors.confirm} />}
                  </div>

                  <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
                    <button
                      type="submit"
                      disabled={changing}
                      className="btn btn-primary"
                      style={{ minWidth: 160 }}
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
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div style={{
              background: '#fff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-light)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '20px 32px',
                borderBottom: '1px solid var(--color-border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(26, 86, 219, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-primary)',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>
                    Account Information
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    Your account details and profile info
                  </p>
                </div>
              </div>

              <div style={{ padding: '24px 32px 32px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  marginBottom: 28,
                  paddingBottom: 24,
                  borderBottom: '1px solid var(--color-border-light)',
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '1.25rem',
                    flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  <div>
                    <h2 style={{ margin: '0 0 2px', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>
                      {user?.fullName || user?.username}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                      @{user?.username} &middot; {user?.role}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
                  <InfoField label="Full Name" value={user?.fullName || '—'} />
                  <InfoField label="Username" value={user?.username || '—'} />
                  <InfoField label="Email" value={user?.email || '—'} />
                  <InfoField label="Role" value={user?.role || '—'} />
                  <InfoField label="Permissions" value={`${user?.permissions?.length || 0} module${(user?.permissions?.length || 0) !== 1 ? 's' : ''}`} />
                  {user?.lastLoginAt && (
                    <InfoField
                      label="Last Login"
                      value={new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div style={{
              background: '#fff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-light)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '20px 32px',
                borderBottom: '1px solid var(--color-border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(26, 86, 219, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-primary)',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>
                    Preferences
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    Customize your experience
                  </p>
                </div>
              </div>

              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--color-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>Preferences coming soon</p>
                <p style={{ fontSize: '0.8rem', margin: '4px 0 0' }}>Theme, language, and notification settings will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleButton({ show, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'absolute', right: 10, background: 'none', border: 'none',
        cursor: 'pointer', color: 'var(--color-text-light)', padding: 6,
        display: 'flex', minHeight: 'auto',
      }}
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {show
          ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
        }
      </svg>
    </button>
  );
}

function FieldError({ msg }) {
  return <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-error)' }}>{msg}</p>;
}

function InfoField({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-heading)', fontWeight: 500 }}>{value}</div>
    </div>
  );
}
