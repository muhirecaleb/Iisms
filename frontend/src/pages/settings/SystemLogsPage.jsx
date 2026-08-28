import { useState, useEffect, useCallback } from 'react';
import { listLogs, getLogStats, getActionTypes, getModuleKeys } from '../../services/systemLogs.service';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ClipboardList, BarChart3, Users } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────
const actionColors = {
  login: '#059669',
  logout: '#64748B',
  login_failed: '#DC2626',
  create: '#2563EB',
  update: '#D97706',
  delete: '#DC2626',
};

const actionLabels = {
  login: 'Logged in',
  logout: 'Logged out',
  login_failed: 'Login failed',
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
};

const moduleLabels = {
  auth: 'Authentication',
  students: 'Students',
  staff: 'Staff',
  tasks: 'Tasks',
  'user-management': 'Users',
  'system-settings': 'System',
  finance: 'Finance',
};

function getActionColor(action) {
  return actionColors[action] || '#64748B';
}

// ─── Stats Cards ─────────────────────────────────────────────
function StatsCards({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: 'Total Logs', value: stats.totalLogs?.toLocaleString(), color: '#2563EB', Icon: ClipboardList },
    { label: "Today's Activity", value: stats.todayLogs, color: '#059669', Icon: BarChart3 },
    { label: 'Active Users Today', value: stats.activeUsers, color: '#7C3AED', Icon: Users },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background: '#fff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-light)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `${card.color}10`, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <card.Icon size={22} color={card.color} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>
              {card.value ?? '—'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 500 }}>
              {card.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function SystemLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter options
  const [actionTypes, setActionTypes] = useState([]);
  const [moduleKeys, setModuleKeys] = useState([]);

  // Expanded row
  const [expandedId, setExpandedId] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load filter options
  useEffect(() => {
    getActionTypes().then(setActionTypes).catch(() => {});
    getModuleKeys().then(setModuleKeys).catch(() => {});
    getLogStats().then(setStats).catch(() => {});
  }, []);

  // Fetch logs
  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await listLogs({
        page,
        limit: 50,
        action: actionFilter || undefined,
        moduleKey: moduleFilter || undefined,
        search: debouncedSearch || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setLogs(result.data || []);
      setPagination(result.pagination || { page, limit: 50, total: 0, totalPages: 0 });
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, actionFilter, moduleFilter, startDate, endDate]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchLogs(page);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setActionFilter('');
    setModuleFilter('');
    setStartDate('');
    setEndDate('');
  };

  const hasFilters = search || actionFilter || moduleFilter || startDate || endDate;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>
          System Logs
        </h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
          Audit trail of all system activities
        </p>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Filters */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-light)', padding: '16px 20px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              style={{
                width: '100%', padding: '8px 12px 8px 34px', fontSize: '0.85rem',
                border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                background: '#fff', color: 'var(--color-text-heading)', outline: 'none',
                boxSizing: 'border-box', minHeight: 36,
              }}
            />
          </div>

          {/* Action filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{
              padding: '8px 12px', fontSize: '0.85rem',
              border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
              background: '#fff', color: 'var(--color-text-heading)', outline: 'none',
              minHeight: 36, cursor: 'pointer',
            }}
          >
            <option value="">All Actions</option>
            {actionTypes.map((a) => (
              <option key={a} value={a}>{actionLabels[a] || a}</option>
            ))}
          </select>

          {/* Module filter */}
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            style={{
              padding: '8px 12px', fontSize: '0.85rem',
              border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
              background: '#fff', color: 'var(--color-text-heading)', outline: 'none',
              minHeight: 36, cursor: 'pointer',
            }}
          >
            <option value="">All Modules</option>
            {moduleKeys.map((m) => (
              <option key={m} value={m}>{moduleLabels[m] || m}</option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="From"
            style={{
              padding: '8px 12px', fontSize: '0.85rem',
              border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
              background: '#fff', color: 'var(--color-text-heading)', outline: 'none',
              minHeight: 36,
            }}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="To"
            style={{
              padding: '8px 12px', fontSize: '0.85rem',
              border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
              background: '#fff', color: 'var(--color-text-heading)', outline: 'none',
              minHeight: 36,
            }}
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{
                padding: '8px 16px', fontSize: '0.8rem', fontWeight: 500,
                color: 'var(--color-text)', background: 'var(--color-bg)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', minHeight: 36, whiteSpace: 'nowrap',
              }}
            >
              Clear
            </button>
          )}
        </div>
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
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Module</th>
                <th style={thStyle}>User</th>
                <th style={{ ...thStyle, minWidth: 250 }}>Description</th>
                <th style={{ ...thStyle, textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} style={{ padding: '14px 16px' }}>
                        <div style={{
                          height: 14, background: 'var(--color-border)', borderRadius: 4,
                          width: j === 4 ? '80%' : '60%',
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                    {hasFilters ? 'No logs match your filters' : 'No logs yet'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.log_id}
                    style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-heading)' }}>
                        {log.created_at ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true }) : '—'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', fontFamily: 'monospace' }}>
                        {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: '0.75rem', fontWeight: 600,
                        color: '#fff', background: getActionColor(log.action),
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                        {moduleLabels[log.module_key] || log.module_key}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: 'var(--color-text-heading)', fontWeight: 500 }}>
                        {log.user_name || 'System'}
                      </span>
                      {log.username && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>
                          @{log.username}
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 300 }}>
                      <span style={{
                        color: 'var(--color-text)', lineHeight: 1.4,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: expandedId === log.log_id ? 'unset' : 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {log.description || '—'}
                      </span>
                      {log.entity_id && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: 2 }}>
                          ID: {log.entity_id}
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      {(log.old_values || log.new_values || log.ip_address) && (
                        <button
                          onClick={() => setExpandedId(expandedId === log.log_id ? null : log.log_id)}
                          style={{
                            background: 'none', border: '1px solid var(--color-border)',
                            borderRadius: 6, padding: '4px 10px', fontSize: '0.7rem',
                            fontWeight: 500, color: 'var(--color-text-light)',
                            cursor: 'pointer', minHeight: 'auto',
                          }}
                        >
                          {expandedId === log.log_id ? 'Less' : 'Details'}
                        </button>
                      )}
                    </td>
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
            borderTop: '1px solid var(--color-border-light)', background: 'var(--color-bg)',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total.toLocaleString()} total)
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <PageBtn disabled={pagination.page <= 1} onClick={() => goToPage(pagination.page - 1)}>
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
              <PageBtn disabled={pagination.page >= pagination.totalPages} onClick={() => goToPage(pagination.page + 1)}>
                Next
              </PageBtn>
            </div>
          </div>
        )}
      </div>

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
const thStyle = {
  padding: '12px 16px', textAlign: 'left', fontWeight: 600,
  fontSize: '0.8rem', color: 'var(--color-text-light)',
  textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap',
};

const tdStyle = { padding: '12px 16px', whiteSpace: 'nowrap' };

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
