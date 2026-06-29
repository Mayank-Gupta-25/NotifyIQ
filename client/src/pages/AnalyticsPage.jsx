import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PRIORITY_COLORS = {
  critical: '#FF4757',
  important: '#FFA502',
  low: '#3742FA',
  noise: '#747D8C'
};

const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);

  const fetchData = async () => {
    if (window.electronAPI) {
      const summaryData = await window.electronAPI.getAnalyticsSummary();
      const trendsData = await window.electronAPI.getAnalyticsTrends();
      setSummary(summaryData);
      setTrends(trendsData);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (!summary) {
    return (
      <>
        <Header title="Analytics" subtitle="Insights & metrics" />
        <div className="feed-container">
          <div className="glass empty-state"><div className="empty-icon">⏳</div><h3>Loading...</h3></div>
        </div>
      </>
    );
  }

  const priorityData = Object.entries(summary.byPriority || {}).map(([name, value]) => ({ name, value }));
  const appData = (summary.byApp || []).map(a => ({ name: a._id, count: a.count }));

  return (
    <>
      <Header title="Analytics" subtitle="Notification insights & metrics">
        <button className="action-btn" onClick={fetchData}
          style={{ padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}>
          🔄 Refresh
        </button>
      </Header>
      <div className="feed-container" style={{ maxWidth: '900px' }}>

        {/* Stats Cards Row */}
        <div className="stats-grid-4">
          <div className="glass animate-fade-in-up" style={{ padding: 'var(--space-4)', borderRadius: 'var(--border-radius-md)', textAlign: 'center', borderTop: '3px solid var(--accent-primary)' }}>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--accent-primary)' }}>{summary.total}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Total Notifications</div>
          </div>
          <div className="glass animate-fade-in-up" style={{ padding: 'var(--space-4)', borderRadius: 'var(--border-radius-md)', textAlign: 'center', borderTop: '3px solid var(--accent-success)' }}>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--accent-success)' }}>{summary.suppressedCount}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Suppressed</div>
          </div>
          <div className="glass animate-fade-in-up" style={{ padding: 'var(--space-4)', borderRadius: 'var(--border-radius-md)', textAlign: 'center', borderTop: '3px solid var(--accent-secondary)' }}>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--accent-secondary)' }}>{summary.timeSaved?.formatted}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Time Saved</div>
          </div>
          <div className="glass animate-fade-in-up" style={{ padding: 'var(--space-4)', borderRadius: 'var(--border-radius-md)', textAlign: 'center', borderTop: '3px solid var(--priority-critical)' }}>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--priority-critical)' }}>{summary.byPriority?.critical || 0}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Critical Alerts</div>
          </div>
        </div>

        {/* Priority Breakdown (Pie) + App Breakdown (Bar) */}
        <div className="charts-grid-2">
          {/* Pie Chart */}
          <div className="glass animate-fade-in-up" style={{ padding: 'var(--space-5)', borderRadius: 'var(--border-radius-lg)' }}>
            <h4 style={{ marginBottom: 'var(--space-4)' }}>Priority Breakdown</h4>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`}>
                    {priorityData.map((entry) => (
                      <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#747D8C'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No data yet</p>
            )}
          </div>

          {/* Bar Chart - App Breakdown */}
          <div className="glass animate-fade-in-up" style={{ padding: 'var(--space-5)', borderRadius: 'var(--border-radius-lg)' }}>
            <h4 style={{ marginBottom: 'var(--space-4)' }}>Top Apps</h4>
            {appData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={appData} layout="vertical">
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis dataKey="name" type="category" width={80} stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                  <Bar dataKey="count" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No data yet</p>
            )}
          </div>
        </div>

        {/* 24h Trend Chart */}
        <div className="glass animate-fade-in-up" style={{ padding: 'var(--space-5)', borderRadius: 'var(--border-radius-lg)' }}>
          <h4 style={{ marginBottom: 'var(--space-4)' }}>24-Hour Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trends}>
              <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={10} interval={2} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Bar dataKey="critical" stackId="a" fill={PRIORITY_COLORS.critical} />
              <Bar dataKey="important" stackId="a" fill={PRIORITY_COLORS.important} />
              <Bar dataKey="low" stackId="a" fill={PRIORITY_COLORS.low} />
              <Bar dataKey="noise" stackId="a" fill={PRIORITY_COLORS.noise} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default AnalyticsPage;
