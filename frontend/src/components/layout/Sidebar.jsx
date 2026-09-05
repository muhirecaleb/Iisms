import { useState, useRef, useEffect, useCallback } from 'react';
import logoSvg from '../../assets/logo.png';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listNotifications, getUnreadCount, markAsRead, markAllAsRead as apiMarkAllAsRead, deleteNotification, subscribeToNotifications } from '../../services/notifications.service';
import { formatDistanceToNow } from 'date-fns';

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
    label: 'Library',
    path: '/library',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    module: 'library',
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
  {
    label: 'Users',
    path: '/users',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    module: 'user-management',
  },
  {
    label: 'Logs',
    path: '/system-logs',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    module: 'system-settings',
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

export default function Sidebar() {
  const { user, hasPermission, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [compact, setCompact] = useState(window.innerWidth < 1024);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Collapse to icon-only rail on narrow screens
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const handler = (e) => setCompact(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ─── Notification state ──────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [taskUnreadCount, setTaskUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifPage, setNotifPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ─── Fetch notifications ────────────────────────────────────
  const fetchNotifications = useCallback(async (page = 1, prepend = false) => {
    setNotifLoading(true);
    try {
      const result = await listNotifications({ page, limit: 10 });
      const items = result.data || [];
      if (prepend) {
        setNotifications((prev) => [...items, ...prev.filter((n) => !items.find((i) => i.notification_id === n.notification_id))]);
      } else {
        setNotifications((prev) => page === 1 ? items : [...prev, ...items]);
      }
      setHasMore(items.length === 10);
      setNotifPage(page);
    } catch {
      // Silent fail
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
      const taskCount = await getUnreadCount('tasks');
      setTaskUnreadCount(taskCount);
    } catch {
      // Silent fail
    }
  }, []);

  // ─── SSE connection for real-time updates ───────────────────
  useEffect(() => {
    fetchUnreadCount();

    const { unsubscribe } = subscribeToNotifications((event) => {
      if (event.type === 'unread_count') {
        setUnreadCount(event.count);
        // Re-fetch task count when total changes
        getUnreadCount('tasks').then(setTaskUnreadCount).catch(() => {});
      } else if (event.type === 'connected') {
        // Connected
      } else if (event.type === 'error') {
        console.warn('SSE error:', event.message);
      } else {
        // New notification received - add to top of list
        setNotifications((prev) => [
          { notification_id: event.notification_id, ...event, is_read: 0 },
          ...prev,
        ]);
        setUnreadCount((prev) => prev + 1);
        if (event.module_key === 'tasks') {
          setTaskUnreadCount((prev) => prev + 1);
        }
      }
    });

    return () => unsubscribe();
  }, [fetchUnreadCount]);

  // ─── Fetch notifications when dropdown opens ────────────────
  useEffect(() => {
    if (notifOpen && notifications.length === 0) {
      fetchNotifications(1);
    }
  }, [notifOpen, fetchNotifications, notifications.length]);

  // ─── Clear task unread count when visiting Tasks page ────────
  useEffect(() => {
    if (location.pathname === '/tasks' && taskUnreadCount > 0) {
      setTaskUnreadCount(0);
    }
  }, [location.pathname, taskUnreadCount]);

  // ─── Notification actions ────────────────────────────────────
  const handleMarkAsRead = async (notifId) => {
    try {
      await markAsRead(notifId);
      setNotifications((prev) => prev.map((n) => n.notification_id === notifId ? { ...n, is_read: 1 } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silent fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiMarkAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch {
      // Silent fail
    }
  };

  const handleDeleteNotification = async (notifId) => {
    try {
      await deleteNotification(notifId);
      setNotifications((prev) => prev.filter((n) => n.notification_id !== notifId));
      const deleted = notifications.find((n) => n.notification_id === notifId);
      if (deleted && !deleted.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Silent fail
    }
  };

  const handleLoadMore = () => {
    if (!notifLoading && hasMore) {
      fetchNotifications(notifPage + 1);
    }
  };

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

  return (
    <aside
      style={{
        width: compact ? 72 : 'var(--sidebar-width)',
        flexShrink: 0,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100,
        borderRight: '1px solid var(--color-border-light)',
        boxShadow: '1px 0 3px rgba(0,0,0,0.04)',
        transition: 'width 0.25s ease',
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        title="IISMS — Home"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: compact ? 'center' : 'flex-start',
          gap: 10,
          padding: compact ? '16px 8px' : '18px 20px',
          borderBottom: '1px solid var(--color-border-light)',
          cursor: 'pointer',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        <img
          src={logoSvg}
          alt="IISMS Logo"
          style={{ height: 36, width: 'auto', flexShrink: 0 }}
        />
        {!compact && (
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#93010b', letterSpacing: 0.5 }}>IISMS</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#1a76d1', letterSpacing: 1, textTransform: 'uppercase' }}>School Management</div>
          </div>
        )}
      </div>

      {/* Navigation links */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px 10px',
          scrollbarWidth: 'thin',
        }}
      >
        {navItems.map((item, idx) => {
          if (item.divider) {
            return (
              <div
                key={`divider-${idx}`}
                style={{
                  height: 1,
                  background: 'var(--color-border-light)',
                  margin: '8px 6px',
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
          const showDot = item.path === '/tasks' && taskUnreadCount > 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={compact ? item.label : undefined}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: compact ? 'center' : 'flex-start',
                gap: 12,
                padding: compact ? '10px 0' : '10px 14px',
                margin: compact ? '0 4px' : 0,
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
                flexShrink: 0,
              }}
            >
              <span style={{ display: 'flex', flexShrink: 0 }}>{item.icon}</span>
              {!compact && <span>{item.label}</span>}

              {/* Unread task indicator dot */}
              {showDot && (
                <span
                  style={{
                    position: 'absolute',
                    right: compact ? 14 : 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#DC2626',
                    flexShrink: 0,
                    boxShadow: '0 0 0 2px #fff',
                  }}
                />
              )}

              {/* Left active indicator bar */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '25%',
                  height: '50%',
                  width: 3,
                  borderRadius: '0 3px 3px 0',
                  background: isActive
                    ? '#93010b'
                    : isHovered
                      ? 'rgba(147, 1, 11, 0.4)'
                      : 'transparent',
                  transition: 'all 0.3s ease',
                }}
              />
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section: Notifications + User */}
      <div
        style={{
          borderTop: '1px solid var(--color-border-light)',
          padding: '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Notification bell with dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: compact ? 'center' : 'flex-start',
              gap: 10,
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              color: '#64748B',
              cursor: 'pointer',
              padding: compact ? '10px 0' : '10px 12px',
              position: 'relative',
              minHeight: 'auto',
              transition: 'all 0.2s ease',
            }}
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {!compact && (
              <span style={{ fontSize: '0.8rem', fontWeight: 500, flex: 1, textAlign: 'left' }}>Notifications</span>
            )}
            {unreadCount > 0 && (
              <span
                style={{
                  position: compact ? 'absolute' : 'static',
                  top: compact ? 4 : 'auto',
                  right: compact ? 4 : 'auto',
                  minWidth: 18,
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
                  padding: compact ? 0 : '0 4px',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown — opens to the right of the sidebar */}
          {notifOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                left: 'calc(100% + 12px)',
                bottom: 0,
                width: 380,
                maxWidth: 'calc(100vw - 90px)',
                background: '#fff',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                border: '1px solid var(--color-border-light)',
                overflow: 'hidden',
                zIndex: 300,
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
                    onClick={handleMarkAllRead}
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
                {notifLoading && notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 8px', opacity: 0.4 }}>
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <div>No notifications yet</div>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.notification_id}
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: '14px 16px',
                        borderBottom: '1px solid var(--color-border-light)',
                        background: notif.is_read ? 'transparent' : 'rgba(26, 86, 219, 0.04)',
                        transition: 'background 0.15s',
                        position: 'relative',
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
                            fontWeight: notif.is_read ? 500 : 600,
                            color: 'var(--color-text-heading)',
                          }}>
                            {notif.title}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            {!notif.is_read && (
                              <span style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: 'var(--color-primary)',
                              }} />
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notif.notification_id);
                              }}
                              title="Delete"
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--color-text-light)', padding: 2, display: 'flex',
                                minHeight: 'auto', opacity: 0.5, transition: 'opacity 0.15s',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                              onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.5; }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p style={{
                          margin: '2px 0 0',
                          fontSize: '0.8rem',
                          color: 'var(--color-text-light)',
                          lineHeight: 1.4,
                        }}>
                          {notif.message}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>
                            {notif.created_at ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true }) : ''}
                          </span>
                          {!notif.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notif.notification_id);
                              }}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '0.7rem', color: 'var(--color-primary)',
                                fontWeight: 600, minHeight: 'auto', padding: '2px 4px',
                              }}
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {/* Load more */}
                {hasMore && notifications.length > 0 && (
                  <button
                    onClick={handleLoadMore}
                    disabled={notifLoading}
                    style={{
                      width: '100%', padding: '10px 16px', background: 'none',
                      border: 'none', cursor: notifLoading ? 'default' : 'pointer',
                      fontSize: '0.8rem', color: 'var(--color-primary)',
                      fontWeight: 600, opacity: notifLoading ? 0.5 : 1,
                    }}
                  >
                    {notifLoading ? 'Loading...' : 'Load more'}
                  </button>
                )}
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
                  Close
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
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: compact ? 'center' : 'flex-start',
              gap: 8,
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              cursor: 'pointer',
              padding: compact ? '5px 0' : '5px 10px 5px 5px',
              minHeight: 'auto',
              color: '#0A0C1B',
            }}
            title={compact ? (user?.fullName || user?.username) : undefined}
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
            {!compact && (
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0A0C1B', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.fullName || user?.username}
              </span>
            )}
            {!compact && (
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
                  flexShrink: 0,
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </button>

          {/* User dropdown — opens to the right of the sidebar */}
          {userMenuOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                left: 'calc(100% + 12px)',
                bottom: 0,
                width: 220,
                background: '#fff',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                border: '1px solid var(--color-border-light)',
                overflow: 'hidden',
                zIndex: 300,
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
    </aside>
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








