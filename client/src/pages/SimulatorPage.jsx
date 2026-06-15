import { useState } from 'react';
import Header from '../components/layout/Header';
import { PRIORITY_CONFIG } from '../../../shared/constants';

const SimulatorPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [speed, setSpeed] = useState(5000);
  const [log, setLog] = useState([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, important: 0, low: 0, noise: 0 });

  const addLog = (msg, priority = null) => {
    setLog(prev => [{ text: `[${new Date().toLocaleTimeString()}] ${msg}`, priority, time: Date.now() }, ...prev].slice(0, 30));
  };

  const updateStats = (priority) => {
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      [priority]: (prev[priority] || 0) + 1
    }));
  };

  const sendOne = async () => {
    const res = await fetch('/api/simulator/send', { method: 'POST' });
    const data = await res.json();
    addLog(`[${data.priority?.toUpperCase()}] ${data.sourceApp}: "${data.title}" (Score: ${data.score})`, data.priority);
    updateStats(data.priority);
  };

  const startSim = async () => {
    await fetch('/api/simulator/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speedMs: speed })
    });
    setIsRunning(true);
    addLog(`Auto-simulation started (1 every ${speed / 1000}s)`);
  };

  const stopSim = async () => {
    await fetch('/api/simulator/stop', { method: 'POST' });
    setIsRunning(false);
    addLog('Simulation stopped');
  };

  const sendBurst = async () => {
    addLog('🔥 Burst mode: Sending 10 notifications...');
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 300));
      await sendOne();
    }
    addLog('🔥 Burst complete!');
  };

  const runDemo = async () => {
    setIsDemoRunning(true);
    addLog('🎬 Demo Mode started — watch the Live Feed!');
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 2000));
      await sendOne();
    }
    setIsDemoRunning(false);
    addLog('🎬 Demo complete! Check your Live Feed and Digest pages.');
  };

  const clearAll = async () => {
    await fetch('/api/notifications/clear', { method: 'DELETE' });
    setStats({ total: 0, critical: 0, important: 0, low: 0, noise: 0 });
    setLog([]);
    addLog('🧹 All notifications cleared');
  };

  const getPriorityColor = (priority) => {
    const config = PRIORITY_CONFIG[priority];
    return config ? config.color : 'var(--text-secondary)';
  };

  return (
    <>
      <Header title="Simulator" subtitle="Generate, test, and demo notifications" />
      <div className="feed-container" style={{ maxWidth: '800px' }}>

        {/* Live Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          {[
            { label: 'Total', value: stats.total, color: 'var(--accent-primary)' },
            { label: 'Critical', value: stats.critical, color: 'var(--priority-critical)' },
            { label: 'Important', value: stats.important, color: 'var(--priority-important)' },
            { label: 'Low', value: stats.low, color: 'var(--priority-low)' },
            { label: 'Noise', value: stats.noise, color: 'var(--priority-noise)' },
          ].map(s => (
            <div key={s.label} className="glass animate-fade-in-up"
              style={{ padding: 'var(--space-3)', borderRadius: 'var(--border-radius-md)', textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="glass" style={{ padding: 'var(--space-5)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>🎮 Controls</h3>

          {/* Speed Control */}
          <div style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Speed:</label>
            <input type="range" min="1000" max="10000" step="1000" value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              style={{ flex: 1 }} disabled={isRunning} />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', minWidth: '60px' }}>{speed / 1000}s</span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button className="action-btn" onClick={sendOne} disabled={isDemoRunning}
              style={{ padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)' }}>
              📤 Send One
            </button>
            {!isRunning ? (
              <button className="action-btn" onClick={startSim} disabled={isDemoRunning}
                style={{ padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--accent-success)', borderColor: 'var(--accent-success)' }}>
                ▶ Start Auto
              </button>
            ) : (
              <button className="action-btn" onClick={stopSim}
                style={{ padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--priority-critical)', borderColor: 'var(--priority-critical)' }}>
                ⏹ Stop
              </button>
            )}
            <button className="action-btn" onClick={sendBurst} disabled={isRunning || isDemoRunning}
              style={{ padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--accent-warning)', borderColor: 'var(--accent-warning)' }}>
              🔥 Burst (10)
            </button>
            <button className="action-btn" onClick={runDemo} disabled={isRunning || isDemoRunning}
              style={{ padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)' }}>
              {isDemoRunning ? '⏳ Running...' : '🎬 Demo Mode'}
            </button>
            <button className="action-btn dismiss" onClick={clearAll}
              style={{ padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)' }}>
              🗑️ Clear All
            </button>
          </div>
        </div>

        {/* Activity Log */}
        <div className="glass" style={{ padding: 'var(--space-5)', borderRadius: 'var(--border-radius-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>📋 Classification Log</h3>
          {log.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No activity yet. Click a button above to start generating notifications.</p>
          ) : (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '400px', overflowY: 'auto' }}>
              {log.map((entry, i) => (
                <div key={i} className={i === 0 ? 'animate-fade-in' : ''}
                  style={{
                    color: entry.priority ? getPriorityColor(entry.priority) : 'var(--text-secondary)',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--border-radius-sm)',
                    background: entry.priority ? `${getPriorityColor(entry.priority)}10` : 'transparent',
                    borderLeft: entry.priority ? `3px solid ${getPriorityColor(entry.priority)}` : '3px solid transparent'
                  }}>
                  {entry.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SimulatorPage;
