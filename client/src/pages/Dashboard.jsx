// import { useEffect, useState } from 'react';
// import { useSocket } from '../context/SocketContext';
// import NotificationCard from '../components/notifications/NotificationCard';
// import { SOCKET_EVENTS } from '../../../shared/constants';

// const Dashboard = () => {
//   const { socket, isConnected } = useSocket();
//   const [notifications, setNotifications] = useState([]);

//   // Fetch initial history
//   useEffect(() => {
//     fetch('/api/notifications')
//       .then(res => res.json())
//       .then(data => setNotifications(data))
//       .catch(err => console.error("Failed to fetch history:", err));
//   }, []);

//   // Listen for live WebSocket notifications
//   useEffect(() => {
//     if (!socket) return;

//     const handleNewNotification = (notification) => {
//       // Add new notification to the top of the list
//       setNotifications(prev => [notification, ...prev]);
//     };

//     socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);

//     return () => {
//       socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
//     };
//   }, [socket]);

//   return (
//     <div className="container" style={{ paddingTop: '2rem' }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
//         <div>
//           <h1>Live Feed</h1>
//           <p>Real-time Smart Notification Triage</p>
//         </div>
//         <div>
//           <span style={{ 
//             display: 'inline-flex', 
//             alignItems: 'center', 
//             gap: '0.5rem',
//             padding: '0.5rem 1rem',
//             background: 'var(--bg-card)',
//             borderRadius: 'var(--border-radius-full)',
//             fontSize: 'var(--font-size-sm)'
//           }}>
//             <span style={{ 
//               width: '8px', height: '8px', borderRadius: '50%', 
//               backgroundColor: isConnected ? 'var(--accent-success)' : 'var(--priority-critical)' 
//             }} />
//             {isConnected ? 'System Live' : 'Disconnected'}
//           </span>
//         </div>
//       </div>

//       <div style={{ maxWidth: '600px', margin: '0 auto' }}>
//         {notifications.length === 0 ? (
//           <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--border-radius-lg)' }}>
//             <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
//             <h3>Inbox Zero</h3>
//             <p>You have no pending notifications.</p>
//           </div>
//         ) : (
//           notifications.map(notif => (
//             <NotificationCard key={notif._id} notification={notif} />
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import NotificationCard from '../components/notifications/NotificationCard';
import Header from '../components/layout/Header';
import { SOCKET_EVENTS, PRIORITY_CONFIG } from '../../../shared/constants';

const FILTERS = [
  { key: 'all', label: 'All', icon: '📥' },
  { key: 'critical', label: 'Critical', icon: '🔴' },
  { key: 'important', label: 'Important', icon: '🟡' },
  { key: 'low', label: 'Low', icon: '🔵' },
  { key: 'noise', label: 'Noise', icon: '⚪' },
];

const Dashboard = () => {
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch initial history
  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error("Failed to fetch history:", err));
  }, []);

  // Listen for live WebSocket notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
    return () => socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification);
  }, [socket]);

  // Actions
  const handleDismiss = async (id) => {
    await fetch(`/api/notifications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'dismissed' })
    });
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const handleArchive = async (id) => {
    await fetch(`/api/notifications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'archived' })
    });
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  // Filtering
  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.priority === activeFilter);

  // Count per priority
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
          <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}
            style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isConnected ? 'var(--accent-success)' : 'var(--priority-critical)' }} />
          {isConnected ? 'System Live' : 'Disconnected'}
        </div>
      </Header>

      {/* Priority Filter Bar */}
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

      {/* Notification Feed */}
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
