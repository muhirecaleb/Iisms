import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ children }) {
  // Start collapsed on narrow screens; user can toggle via the top bar button
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  // Unread task count is managed by TopBar (notifications) and shown on the sidebar nav dot
  const [taskUnreadCount, setTaskUnreadCount] = useState(0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex' }}>
      <Sidebar collapsed={collapsed} taskUnreadCount={taskUnreadCount} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          onTaskUnreadCount={setTaskUnreadCount}
        />
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
    </div>
  );
}
