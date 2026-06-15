import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { PRIORITY_CONFIG } from '../../../shared/constants';

const DigestPage = () => {
  const [digests, setDigests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDigests = async () => {
    const res = await fetch('/api/digests');
    const data = await res.json();
    setDigests(data);
  };

  useEffect(() => { fetchDigests(); }, []);

  const generateNow = async () => {
    setLoading(true);
    const res = await fetch('/api/digests/generate', { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    if (data._id) {
      fetchDigests(); // Refresh list
    } else {
      alert(data.message || 'No new notifications to digest.');
    }
  };

  return (
    <>
      <Header title="Daily Digest" subtitle="Your low-priority notifications, summarized">
        <button className="action-btn" onClick={generateNow} disabled={loading}
          style={{ padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}>
          {loading ? '⏳ Generating...' : '🗞️ Generate Now'}
        </button>
      </Header>
      <div className="feed-container">
        {digests.length === 0 ? (
          <div className="glass empty-state">
            <div className="empty-icon">🗞️</div>
            <h3>No Digests Yet</h3>
            <p>Generate your first digest to bundle low-priority notifications.</p>
          </div>
        ) : (
          digests.map(digest => (
            <div key={digest._id} className="glass notification-card animate-fade-in-up" style={{ borderLeft: `4px solid var(--accent-primary)`, cursor: 'default' }}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0 }}>📰 Digest Summary</h4>
                  <span className="card-time">{new Date(digest.generatedAt).toLocaleDateString()}</span>
                </div>
                <p className="card-text" style={{ marginTop: 'var(--space-2)' }}>
                  {digest.summary.totalNotifications} notifications bundled from {digest.summary.topApps?.join(', ') || 'various apps'}
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {digest.sections?.map((section, i) => (
                  <span key={i} className="card-priority-badge" style={{ color: 'var(--accent-secondary)' }}>
                    {section.icon} {section.category} ({section.count})
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default DigestPage;
