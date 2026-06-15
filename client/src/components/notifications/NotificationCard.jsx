// import { formatDistanceToNow } from 'date-fns';
// import { PRIORITY_CONFIG } from '../../../../shared/constants';

// const NotificationCard = ({ notification }) => {
//   const config = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.low;
//   const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });

//   return (
//     <div 
//       className="glass animate-slide-in-right"
//       style={{
//         padding: '1rem',
//         marginBottom: '1rem',
//         borderRadius: 'var(--border-radius-md)',
//         borderLeft: `4px solid ${config.color}`,
//         position: 'relative',
//         overflow: 'hidden'
//       }}
//     >
//       {/* Background glow for critical/important */}
//       {['critical', 'important'].includes(notification.priority) && (
//         <div style={{
//           position: 'absolute',
//           top: 0, left: 0, right: 0, bottom: 0,
//           backgroundColor: config.color,
//           opacity: 0.05,
//           zIndex: 0
//         }} />
//       )}

//       <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
//         <div style={{ fontSize: '1.5rem' }}>{notification.icon || '🔔'}</div>
        
//         <div style={{ flex: 1 }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//             <h4 style={{ margin: '0 0 0.25rem 0' }}>{notification.title}</h4>
//             <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
//               {timeAgo}
//             </span>
//           </div>
          
//           <p style={{ margin: '0 0 0.5rem 0', fontSize: 'var(--font-size-sm)' }}>
//             {notification.body}
//           </p>

//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
//               {notification.sourceApp}
//             </span>
//             <span style={{ 
//               fontSize: 'var(--font-size-xs)', 
//               padding: '2px 8px', 
//               borderRadius: '12px',
//               backgroundColor: `rgba(255,255,255,0.1)`,
//               color: config.color,
//               fontWeight: '600'
//             }}>
//               {config.icon} {config.label}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NotificationCard;
import { formatDistanceToNow } from 'date-fns';
import { PRIORITY_CONFIG } from '../../../../shared/constants';

const NotificationCard = ({ notification, onDismiss, onArchive }) => {
  const config = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.low;
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });

  return (
    <div
      className="glass notification-card animate-slide-in-right"
      style={{ borderLeft: `4px solid ${config.color}` }}
    >
      {/* Background glow for critical/important */}
      {['critical', 'important'].includes(notification.priority) && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: config.color,
          opacity: 0.05,
          zIndex: 0
        }} />
      )}

      <div className="card-content">
        <div className="card-icon">{notification.icon || '🔔'}</div>

        <div className="card-body">
          <div className="card-header">
            <h4 className="card-title">{notification.title}</h4>
            <span className="card-time">{timeAgo}</span>
          </div>

          <p className="card-text">{notification.body}</p>

          <div className="card-footer">
            <span className="card-source">{notification.sourceApp}</span>
            <span className="card-priority-badge" style={{ color: config.color }}>
              {config.icon} {config.label}
            </span>
          </div>

          {/* Action buttons - appear on hover */}
          <div className="card-actions">
            {onDismiss && (
              <button className="action-btn dismiss" onClick={(e) => { e.stopPropagation(); onDismiss(notification._id); }}>
                ✕ Dismiss
              </button>
            )}
            {onArchive && (
              <button className="action-btn archive" onClick={(e) => { e.stopPropagation(); onArchive(notification._id); }}>
                📁 Archive
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
