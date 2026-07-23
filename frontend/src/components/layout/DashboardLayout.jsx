import TopNav from './TopNav';

export default function DashboardLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <TopNav />
      <main
        style={{
          flex: 1,
          padding: '28px 32px',
          overflowY: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  );
}
