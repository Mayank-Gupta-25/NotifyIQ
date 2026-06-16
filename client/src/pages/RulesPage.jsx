import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { PRIORITY, CATEGORY, SIMULATED_APPS } from '../../../shared/constants';

const RulesPage = () => {
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'app', value: '', priority: 'low' });

  const fetchRules = async () => {
    const res = await fetch('/api/rules');
    const data = await res.json();
    setRules(data);
  };

  useEffect(() => { fetchRules(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await fetch('/api/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ type: 'app', value: '', priority: 'low' });
    setShowForm(false);
    fetchRules();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/rules/${id}`, { method: 'DELETE' });
    fetchRules();
  };

  const handleToggle = async (id) => {
    await fetch(`/api/rules/${id}/toggle`, { method: 'PATCH' });
    fetchRules();
  };

  const priorityColor = (p) => {
    const colors = { critical: '#FF4757', important: '#FFA502', low: '#3742FA', noise: '#747D8C' };
    return colors[p] || '#747D8C';
  };

  return (
    <>
      <Header title="Classification Rules" subtitle="Control how notifications are prioritized">
        <button className="action-btn" onClick={() => setShowForm(!showForm)}
          style={{ padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}>
          {showForm ? '✕ Cancel' : '+ New Rule'}
        </button>
      </Header>
      <div className="feed-container">
        {/* Create Rule Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="glass animate-fade-in-up"
            style={{ padding: 'var(--space-5)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--space-4)', borderLeft: '4px solid var(--accent-primary)' }}>
            <h4 style={{ margin: '0 0 var(--space-4) 0' }}>Create New Rule</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {/* Type */}
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>Rule Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value, value: '' })}
                  style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-sm)' }}>
                  <option value="app">By App</option>
                  <option value="category">By Category</option>
                  <option value="keyword">By Keyword</option>
                </select>
              </div>
              {/* Value */}
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
                  {form.type === 'app' ? 'App Name' : form.type === 'category' ? 'Category' : 'Keyword'}
                </label>
                {form.type === 'app' ? (
                  <select value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
                    style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-sm)' }}>
                    <option value="">Select an app...</option>
                    {Object.values(SIMULATED_APPS).map(app => (
                      <option key={app.name} value={app.name}>{app.icon} {app.name}</option>
                    ))}
                  </select>
                ) : form.type === 'category' ? (
                  <select value={form.value} onChange={e => setForm({ ...form, value: e.target.value })}
                    style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-sm)' }}>
                    <option value="">Select a category...</option>
                    {Object.values(CATEGORY).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" placeholder="e.g., urgent, OTP, sale" value={form.value}
                    onChange={e => setForm({ ...form, value: e.target.value })}
                    style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-sm)' }} />
                )}
              </div>
              {/* Priority */}
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>Assign Priority</label>
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                  style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-sm)' }}>
                  {Object.values(PRIORITY).map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="action-btn"
                style={{ padding: '0.6rem 1.5rem', fontSize: 'var(--font-size-sm)', color: 'var(--accent-success)', borderColor: 'var(--accent-success)', alignSelf: 'flex-start' }}
                disabled={!form.value}>
                ✓ Create Rule
              </button>
            </div>
          </form>
        )}

        {/* Rules List */}
        {rules.length === 0 ? (
          <div className="glass empty-state animate-fade-in">
            <div className="empty-icon">📜</div>
            <h3>No Custom Rules</h3>
            <p>Create rules to override how specific apps or categories are prioritized.</p>
          </div>
        ) : (
          rules.map(rule => (
            <div key={rule._id} className="glass notification-card animate-fade-in-up"
              style={{ borderLeft: `4px solid ${priorityColor(rule.priority)}`, opacity: rule.isActive ? 1 : 0.5, cursor: 'default' }}>
              <div className="card-content">
                <div className="card-icon">
                  {rule.type === 'app' ? '📱' : rule.type === 'category' ? '🏷️' : '🔑'}
                </div>
                <div className="card-body">
                  <div className="card-header">
                    <h4 className="card-title">
                      {rule.type === 'app' ? `App: ${rule.value}` :
                       rule.type === 'category' ? `Category: ${rule.value}` :
                       `Keyword: "${rule.value}"`}
                    </h4>
                    <span className="card-priority-badge" style={{ color: priorityColor(rule.priority) }}>
                      {rule.priority}
                    </span>
                  </div>
                  <div className="card-actions" style={{ opacity: 1, pointerEvents: 'all' }}>
                    <button className="action-btn" onClick={() => handleToggle(rule._id)}>
                      {rule.isActive ? '⏸ Disable' : '▶ Enable'}
                    </button>
                    <button className="action-btn dismiss" onClick={() => handleDelete(rule._id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default RulesPage;
