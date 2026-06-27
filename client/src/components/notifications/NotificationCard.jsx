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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {/* Score indicator */}
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Score: {notification.score}
              </span>
              <span className="card-priority-badge" style={{ color: config.color }}>
                {config.icon} {config.label}
              </span>
            </div>
          </div>

          {/* Why this priority? — shown if explanation exists */}
          {notification.explanation && (
            <div style={{
              marginTop: 'var(--space-2)',
              padding: 'var(--space-1) var(--space-2)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--accent-secondary)',
              background: 'rgba(0, 210, 255, 0.08)',
              borderRadius: 'var(--border-radius-sm)',
              borderLeft: '2px solid var(--accent-secondary)'
            }}>
              🧠 {notification.explanation}
            </div>
          )}

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
