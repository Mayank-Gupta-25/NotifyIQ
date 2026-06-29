import { useEffect, useState } from 'react';
import NotificationCard from '../components/notifications/NotificationCard';
import Header from '../components/layout/Header';

const FILTERS = [
  { key: 'all', label: 'All', icon: '📥' },
  { key: 'critical', label: 'Critical', icon: '🔴' },
  { key: 'important', label: 'Important', icon: '🟡' },
  { key: 'low', label: 'Low', icon: '🔵' },
  { key: 'noise', label: 'Noise', icon: '⚪' },
];

const Dashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  // 1. Fetch initial history via Electron IPC
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getNotifications({})
        .then(data => setNotifications(data))
        .catch(err => console.error("Failed to fetch history:", err));
    }
  }, []);

  // 2. Listen for live notifications via Electron IPC
  useEffect(() => {
    if (!window.electronAPI) return;

    // This listener catches the 'notifications:new' event from our main process
    const removeListener = window.electronAPI.onNewNotification((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });
    
    // Clean up on unmount
    return () => {
      if (removeListener) removeListener();
    };
  }, []);

  // Actions
  const handleDismiss = async (id) => {
    if (window.electronAPI) {
      await window.electronAPI.updateNotificationStatus(id, 'dismissed');
      setNotifications(prev => prev.filter(n => n._id !== id));
    }
  };

  const handleArchive = async (id) => {
    if (window.electronAPI) {
      await window.electronAPI.updateNotificationStatus(id, 'archived');
      setNotifications(prev => prev.filter(n => n._id !== id));
    }
  };

  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.priority === activeFilter);

  const counts = {};
  FILTERS.forEach(f => {
    counts[f.key] = f.key === 'all'
      ? notifications.length
      : notifications.filter(n => n.priority === f.key).length;
  });

  return (
    <>
      <Header title="Live Feed" subtitle="Real-time Smart Notification Triage">
        <div className="header-badge">
          <span className="status-dot online" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent-success)' }} />
          Local System Live
        </div>
      </Header>

      <div className="filter-bar">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`filter-chip ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.icon} {f.label}
            <span className="chip-count">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <div className="feed-container">
        {filtered.length === 0 ? (
          <div className="glass empty-state animate-fade-in">
            <div className="empty-icon">📭</div>
            <h3>Inbox Zero</h3>
            <p>No {activeFilter !== 'all' ? activeFilter : ''} notifications right now.</p>
          </div>
        ) : (
          filtered.map(notif => (
            <NotificationCard
              key={notif._id}
              notification={notif}
              onDismiss={handleDismiss}
              onArchive={handleArchive}
            />
          ))
        )}
      </div>
    </>
  );
};

export default Dashboard;
