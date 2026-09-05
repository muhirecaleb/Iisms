import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex' }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: '28px 32px',
          overflowX: 'hidden',
        }}
      >
        {children}
      </main>
    </div>
  );
}
