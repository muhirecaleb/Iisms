import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/dashboard.service';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

// ─── Helper: format currency ───────────────────────────────────
const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// ─── Helper: format number with commas ─────────────────────────
const formatNumber = (num) => {
  const n = Number(num) || 0;
  return n.toLocaleString();
};

// ─── Stat Card Component ───────────────────────────────────────
function StatCard({ title, value, subtitle, icon, color, loading }) {
  if (loading) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 'var(--radius-md)',
        padding: 24,
        border: '1px solid var(--color-border-light)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-border)', marginBottom: 16 }} />
        <div style={{ width: '60%', height: 24, background: 'var(--color-border)', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ width: '40%', height: 14, background: 'var(--color-border-light)', borderRadius: 4 }} />
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--radius-md)',
      padding: 24,
      border: '1px solid var(--color-border-light)',
      transition: 'all 0.25s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Colored accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${color}, ${color}44)`,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `${color}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
        }}>
          {icon}
        </div>
      </div>

      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-heading)', marginBottom: 4, lineHeight: 1.2 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{subtitle}</div>
      )}
    </div>
  );
}

// ─── Chart Card Component ─────────────────────────────────────
function ChartCard({ title, children, color }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border-light)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--color-border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        {color && (
          <div style={{
            width: 10,
            height: 10,
            borderRadius: 4,
            background: color,
          }} />
        )}
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{title}</h3>
      </div>
      <div style={{ padding: '20px 16px' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Mini stat for sub-items ───────────────────────────────────
function MiniStat({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

// ─── Glass Card Component ──────────────────────────────────────
function GlassCard({ title, children, color }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border-light)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--color-border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        {color && (
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
          }} />
        )}
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>{title}</h3>
      </div>
      <div style={{ padding: '16px 24px 20px' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Skeleton for detail cards ─────────────────────────────────
function DetailCardSkeleton() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border-light)',
      overflow: 'hidden',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ padding: '16px 24px' }}>
        <div style={{ width: 120, height: 18, background: 'var(--color-border)', borderRadius: 4, marginBottom: 8 }} />
      </div>
      <div style={{ padding: '16px 24px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <div style={{ width: 100, height: 14, background: 'var(--color-border)', borderRadius: 4 }} />
            <div style={{ width: 80, height: 14, background: 'var(--color-border)', borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ───────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = () => {
    setLoading(true);
    setError(null);
    getDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => {
        setError(err.response?.data?.error?.message || 'Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 16,
        textAlign: 'center',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(220, 38, 38, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-error)',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-heading)' }}>Failed to load dashboard</h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-light)', maxWidth: 400 }}>{error}</p>
        <button
          onClick={fetchStats}
          className="btn btn-primary"
          style={{ marginTop: 8 }}
        >
          Retry
        </button>
      </div>
    );
  }

  const s = stats; // shorthand

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-heading)' }}>
          Dashboard
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
          {loading
            ? 'Loading overview...'
            : s?.academicYear?.year_label
              ? `${s.academicYear.year_label} — ${s.academicYear.current_term || 'No active term'}`
              : 'School overview and key metrics'
          }
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20,
        marginBottom: 28,
      }}>
        <StatCard
          title="Total Students"
          value={loading ? '—' : formatNumber(s?.students?.total || 0)}
          subtitle={loading ? '' : `${formatNumber(s?.students?.active || 0)} active`}
          color="#2563EB"
          loading={loading}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          }
        />
        <StatCard
          title="Staff Members"
          value={loading ? '—' : formatNumber(s?.staff?.total || 0)}
          subtitle={loading ? '' : `${formatNumber(s?.staff?.teaching || 0)} teaching`}
          color="#7C3AED"
          loading={loading}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          title="Revenue Collected"
          value={loading ? '—' : formatCurrency(s?.finance?.totalCollected || 0)}
          subtitle={loading ? '' : `Collection rate: ${s?.finance?.collectionRate || 0}%`}
          color="#059669"
          loading={loading}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <StatCard
          title="Total Invoiced"
          value={loading ? '—' : formatCurrency(s?.finance?.totalInvoiced || 0)}
          subtitle={loading ? '' : `${formatCurrency(s?.finance?.outstanding || 0)} outstanding`}
          color="#DC2626"
          loading={loading}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          }
        />
      </div>

      {/* ─── Charts Section ────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 20,
        marginBottom: 28,
      }}>
        {/* Student Gender Donut Chart */}
        {!loading && (
          <ChartCard title="Student Gender Distribution" color="#2563EB">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Male', value: Number(s?.students?.male) || 0 },
                    { name: 'Female', value: Number(s?.students?.female) || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#2563EB" />
                  <Cell fill="#DC2626" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid var(--color-border-light)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '0.85rem',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '0.8rem', paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Finance Bar Chart */}
        {!loading && (
          <ChartCard title="Finance Overview" color="#059669">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={[
                  { name: 'Invoiced', amount: Number(s?.finance?.totalInvoiced) || 0 },
                  { name: 'Collected', amount: Number(s?.finance?.totalCollected) || 0 },
                  { name: 'Outstanding', amount: Number(s?.finance?.outstanding) || 0 },
                ]}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--color-text-light)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-light)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid var(--color-border-light)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '0.85rem',
                  }}
                  formatter={(value) => [formatCurrency(value), 'Amount']}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {[
                    { name: 'Invoiced', amount: 0, fill: '#2563EB' },
                    { name: 'Collected', amount: 0, fill: '#059669' },
                    { name: 'Outstanding', amount: 0, fill: '#DC2626' },
                  ].map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Student vs Staff Bar Chart */}
        {!loading && (
          <ChartCard title="Student & Staff Count" color="#7C3AED">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={[
                  {
                    name: 'Total',
                    Students: Number(s?.students?.total) || 0,
                    Staff: Number(s?.staff?.total) || 0,
                  },
                  {
                    name: 'Active',
                    Students: Number(s?.students?.active) || 0,
                    Staff: Number(s?.staff?.teaching) || 0,
                  },
                ]}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--color-text-light)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-light)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid var(--color-border-light)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '0.85rem',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: 8 }} />
                <Bar dataKey="Students" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Staff" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Detail Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 20,
      }}>
        {/* Student Details */}
        {loading ? <DetailCardSkeleton /> : (
          <GlassCard title="Student Breakdown" color="#2563EB">
            <MiniStat label="Total Enrolled" value={formatNumber(s?.students?.total || 0)} color="#2563EB" />
            <MiniStat label="Active" value={formatNumber(s?.students?.active || 0)} color="#059669" />
            <MiniStat label="Male" value={formatNumber(s?.students?.male || 0)} color="#2563EB" />
            <MiniStat label="Female" value={formatNumber(s?.students?.female || 0)} color="#DC2626" />
          </GlassCard>
        )}

        {/* Staff Details */}
        {loading ? <DetailCardSkeleton /> : (
          <GlassCard title="Staff Breakdown" color="#7C3AED">
            <MiniStat label="Total Staff" value={formatNumber(s?.staff?.total || 0)} color="#7C3AED" />
            <MiniStat label="Teaching" value={formatNumber(s?.staff?.teaching || 0)} color="#7C3AED" />
            <MiniStat label="Administrative" value={formatNumber(s?.staff?.administrative || 0)} color="#7C3AED" />
            <MiniStat label="Support" value={formatNumber(s?.staff?.support || 0)} color="#7C3AED" />
          </GlassCard>
        )}

        {/* Finance Details */}
        {loading ? <DetailCardSkeleton /> : (
          <GlassCard title="Finance Overview" color="#059669">
            <MiniStat label="Total Invoiced" value={formatCurrency(s?.finance?.totalInvoiced || 0)} color="#059669" />
            <MiniStat label="Total Collected" value={formatCurrency(s?.finance?.totalCollected || 0)} color="#059669" />
            <MiniStat label="Outstanding" value={formatCurrency(s?.finance?.outstanding || 0)} color="#DC2626" />
            <MiniStat label="Collection Rate" value={`${s?.finance?.collectionRate || 0}%`} color="#059669" />
          </GlassCard>
        )}

        {/* Tasks */}
        {loading ? <DetailCardSkeleton /> : (
          <GlassCard title="Tasks Overview" color="#D97706">
            <MiniStat label="Pending" value={formatNumber(s?.tasks?.pending || 0)} color="#D97706" />
            <MiniStat label="In Progress" value={formatNumber(s?.tasks?.inProgress || 0)} color="#2563EB" />
            <MiniStat label="Overdue" value={formatNumber(s?.tasks?.overdue || 0)} color="#DC2626" />
            <MiniStat label="Total" value={formatNumber(
              (s?.tasks?.pending || 0) + (s?.tasks?.inProgress || 0) + (s?.tasks?.overdue || 0)
            )} color="var(--color-text-heading)" />
          </GlassCard>
        )}
      </div>

      {/* Add pulse animation for loading skeletons */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
