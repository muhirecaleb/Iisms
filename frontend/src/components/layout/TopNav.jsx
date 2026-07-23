import { useState, useRef, useEffect } from 'react';
import logoSvg from '../../assets/logo.png';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    module: null,
  },
  {
    label: 'Students',
    path: '/students',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    module: 'students',
  },
  {
    label: 'Staff',
    path: '/staff',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    module: 'staff',
  },
  {
    label: 'Finance',
    path: '/finance',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    module: 'finance',
  },
  {
    label: 'Tasks',
    path: '/tasks',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    module: 'tasks',
  },
  {
    label: 'Classes',
    path: '/classes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    module: 'classes',
  },
  {
    label: 'Academic Years',
    path: '/academic-years',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    module: 'academic-years',
  },
  {
    label: 'Roles',
    path: '/roles',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    module: 'system',
  },
  { divider: true },
  {
    label: 'Settings',
    path: '/settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    module: null,
  },
];

// ─── Mock notification data ─────────────────────────────────────
const mockNotifications = [
  {
    id: 1,
    type: 'info',
    title: 'New student enrolled',
    description: 'John Doe has been enrolled in Senior 3',
    time: '5 min ago',
    unread: true,
  },
  {
    id: 2,
    type: 'success',
    title: 'Payment received',
    description: 'Tuition fee of 450,000 RWF received from Jane Smith',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: 3,
    type: 'warning',
    title: 'Task assigned',
    description: 'You have been assigned to review term exam results',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 4,
    type: 'info',
    title: 'Staff leave request',
    description: 'Ms. Alice Mutesi has requested annual leave',
    time: '1 day ago',
    unread: false,
  },
  {
    id: 5,
    type: 'system',
    title: 'System update',
    description: 'Academic year 2026 has been activated',
    time: '2 days ago',
    unread: false,
  },
];

function getTypeColor(type) {
  switch (type) {
    case 'success': return '#059669';
    case 'warning': return '#D97706';
    case 'info': return '#2563EB';
    case 'system': return '#7C3AED';
    default: return '#2563EB';
  }
}

function getTypeIcon(type) {
  const props = { width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (type) {
    case 'success':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'warning':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'system':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    default: // info
      return (
        <svg {...props} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

export default function TopNav() {
  const { user, hasPermission, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  // Close user menu on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close notification dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.charAt(0).toUpperCase() || 'U';

  const markAllRead = () => {
    mockNotifications.forEach((n) => { n.unread = false; });
    setNotifOpen(false);
  };

  return (
    <header
      style={{
        height: 64,
        background: '#fff',
        color: '#0A0C1B',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderBottom: '1px solid var(--color-border-light)',
        gap: 8,
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingRight: 20,
          marginRight: 8,
          borderRight: '1px solid var(--color-border)',
          flexShrink: 0,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <img
          src={logoSvg}
          alt="IISMS Logo"
          style={{ height: 36, width: 'auto' }}
        />
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#93010b', letterSpacing: 0.5 }}>IISMS</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#1a76d1', letterSpacing: 1, textTransform: 'uppercase' }}>School Management</div>
        </div>
      </div>

      {/* Navigation links */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flex: 1,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {navItems.map((item, idx) => {
          if (item.divider) {
            return (
              <div
                key={`divider-${idx}`}
                style={{
                  width: 1,
                  height: 24,
                  background: 'var(--color-border)',
                  margin: '0 6px',
                  flexShrink: 0,
                }}
              />
            );
          }

          if (item.module && !hasPermission(item.module)) {
            return null;
          }

          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          const isHovered = hoveredItem === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? '#93010b' : '#0A0C1B',
                background: isActive
                  ? 'rgba(147, 1, 11, 0.06)'
                  : isHovered
                    ? 'var(--color-bg)'
                    : 'transparent',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              {item.icon}
              <span>{item.label}</span>

              {/* Bottom tab indicator (always visible on hover, solid on active) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -2,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: isActive ? 20 : isHovered ? 12 : 0,
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: isActive ? '#93010b' : 'rgba(147, 1, 11, 0.4)',
                  transition: 'all 0.3s ease',
                }}
              />
            </NavLink>
          );
        })}
      </nav>

      {/* Right section: Notifications + User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {/* Notification bell with dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              color: '#64748B',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              minHeight: 'auto',
              transition: 'all 0.2s ease',
            }}
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'var(--color-error)',
                  border: '2px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  color: '#fff',
                  lineHeight: 1,
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                width: 380,
                background: '#fff',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                border: '1px solid var(--color-border-light)',
                overflow: 'hidden',
                zIndex: 200,
                color: 'var(--color-text)',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--color-border-light)',
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>
                  Notifications
                  {unreadCount > 0 && (
                    <span style={{
                      marginLeft: 8,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: '#fff',
                      background: 'var(--color-primary)',
                      borderRadius: 10,
                      padding: '2px 8px',
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                      minHeight: 'auto',
                      padding: '4px 8px',
                      borderRadius: 6,
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--color-border-light)',
                      cursor: 'pointer',
                      background: notif.unread ? 'rgba(26, 86, 219, 0.04)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* Type icon */}
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: `${getTypeColor(notif.type)}12`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getTypeColor(notif.type),
                      flexShrink: 0,
                    }}>
                      {getTypeIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                        marginBottom: 2,
                      }}>
                        <span style={{
                          fontSize: '0.85rem',
                          fontWeight: notif.unread ? 600 : 500,
                          color: 'var(--color-text-heading)',
                        }}>
                          {notif.title}
                        </span>
                        {notif.unread && (
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            flexShrink: 0,
                          }} />
                        )}
                      </div>
                      <p style={{
                        margin: '2px 0 0',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-light)',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {notif.description}
                      </p>
                      <span style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-text-light)',
                        marginTop: 4,
                        display: 'block',
                      }}>
                        {notif.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{
                padding: '10px 16px',
                borderTop: '1px solid var(--color-border-light)',
                textAlign: 'center',
              }}>
                <button
                  onClick={() => { setNotifOpen(false); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-light)',
                    fontWeight: 500,
                    minHeight: 'auto',
                    padding: '4px 8px',
                  }}
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar + dropdown */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              cursor: 'pointer',
              padding: '5px 10px 5px 5px',
              minHeight: 'auto',
              color: '#0A0C1B',
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: user?.avatarUrl ? 'transparent' : '#1a76d1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.7rem',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {user?.avatarUrl ? (
                <img
                  src={`http://localhost:4000${user.avatarUrl.replace(/\\/g, '/')}`}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initials
              )}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0A0C1B' }}>{user?.fullName || user?.username}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                opacity: 0.5,
                transform: userMenuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* User dropdown */}
          {userMenuOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                width: 200,
                background: '#fff',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                border: '1px solid var(--color-border-light)',
                overflow: 'hidden',
                zIndex: 200,
                color: 'var(--color-text)',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border-light)',
                  background: 'var(--color-bg)',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>
                  {user?.fullName || user?.username}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                  {user?.email || ''}
                </div>
              </div>

              <DropdownItem
                onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                }
                label="My Profile"
              />

              <DropdownItem
                onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                }
                label="Settings"
              />

              <div style={{ borderTop: '1px solid var(--color-border-light)' }}>
                <button
                  role="menuitem"
                  onClick={() => { setUserMenuOpen(false); logout(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '10px 16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-error)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    minHeight: 'auto',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownItem({ icon, label, onClick }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '10px 16px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--color-text)',
        fontSize: '0.85rem',
        fontWeight: 500,
        textDecoration: 'none',
        minHeight: 'auto',
      }}
    >
      <span style={{ color: 'var(--color-text-light)', display: 'flex' }}>{icon}</span>
      {label}
    </button>
  );
}
