import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { FOCUS_MODE } from '../../../shared/constants';

const FOCUS_OPTIONS = [
  { key: FOCUS_MODE.OPEN, label: 'Open', icon: '🌐', desc: 'All notifications delivered normally' },
  { key: FOCUS_MODE.WORK, label: 'Work', icon: '💼', desc: 'Only Critical notifications interrupt' },
  { key: FOCUS_MODE.PERSONAL, label: 'Personal', icon: '🏠', desc: 'Critical + Important get through' },
  { key: FOCUS_MODE.DND, label: 'Do Not Disturb', icon: '🔇', desc: 'Nothing gets through, all queued' },
];

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [launchOnStartup, setLaunchOnStartup] = useState(false);

  const fetchUser = async () => {
    if (window.electronAPI) {
      const data = await window.electronAPI.getUserPreferences();
      const startupVal = await window.electronAPI.getLaunchOnStartup();
      setLaunchOnStartup(startupVal);
      // The API returns the whole row for the user
      setUser({
        username: data.username,
        email: data.email,
        preferences: {
          focusMode: data.focus_mode,
          digestTime: data.digest_time
        }
      });
    }
  };

  useEffect(() => { fetchUser(); }, []);

  const handleFocusChange = async (mode) => {
    if (window.electronAPI) {
      await window.electronAPI.updateUserPreferences({ focusMode: mode });
      fetchUser();
    }
  };

  const handleDigestTimeChange = async (time) => {
    if (window.electronAPI) {
      await window.electronAPI.updateUserPreferences({ digestTime: time });
      fetchUser();
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleStartupToggle = async (e) => {
    const isChecked = e.target.checked;
    setLaunchOnStartup(isChecked);
    if (window.electronAPI) {
      await window.electronAPI.setLaunchOnStartup(isChecked);
    }
  };

  return (
    <>
      <Header title="Settings" subtitle="Manage your preferences" />
      <div className="feed-container">
        {/* Theme Toggle */}
        <div className="glass animate-fade-in-up" style={{ padding: 'var(--space-5)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>🎨 Appearance</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </p>
              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)' }}>Switch between dark and light themes</p>
            </div>
            <button className="action-btn" onClick={toggleTheme}
              style={{ padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        {/* Focus Mode */}
        <div className="glass animate-fade-in-up" style={{ padding: 'var(--space-5)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>🎯 Focus Mode</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {FOCUS_OPTIONS.map(opt => (
              <button key={opt.key} className="action-btn"
                onClick={() => handleFocusChange(opt.key)}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  fontSize: 'var(--font-size-sm)',
                  justifyContent: 'flex-start',
                  width: '100%',
                  borderColor: user?.preferences?.focusMode === opt.key ? 'var(--accent-primary)' : 'var(--border-color)',
                  background: user?.preferences?.focusMode === opt.key ? 'rgba(124, 92, 252, 0.15)' : 'transparent',
                  color: user?.preferences?.focusMode === opt.key ? 'var(--accent-primary)' : 'var(--text-secondary)'
                }}>
                <span style={{ marginRight: 'var(--space-2)' }}>{opt.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{opt.label}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7 }}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Digest Time */}
        <div className="glass animate-fade-in-up" style={{ padding: 'var(--space-5)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>🕐 Digest Schedule</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Daily Digest Time
              </p>
              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)' }}>When should we send your daily summary?</p>
            </div>
            <input type="time" value={user?.preferences?.digestTime || '08:00'}
              onChange={e => handleDigestTimeChange(e.target.value)}
              style={{ padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-sm)' }} />
          </div>
        </div>

        {/* System Settings */}
        <div className="glass animate-fade-in-up" style={{ padding: 'var(--space-5)', borderRadius: 'var(--border-radius-lg)', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>⚙️ System</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                Launch on Startup
              </p>
              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)' }}>Start NotifyIQ silently in the system tray when Windows boots.</p>
            </div>
            <label className="toggle-switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
              <input 
                type="checkbox" 
                checked={launchOnStartup} 
                onChange={handleStartupToggle} 
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span className="slider round" style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: launchOnStartup ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                transition: '.4s', borderRadius: '34px'
              }}>
                <span style={{
                  position: 'absolute', content: '""', height: '16px', width: '16px', left: '4px', bottom: '4px',
                  backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                  transform: launchOnStartup ? 'translateX(16px)' : 'translateX(0)'
                }}></span>
              </span>
            </label>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="glass animate-fade-in-up" style={{ padding: 'var(--space-5)', borderRadius: 'var(--border-radius-lg)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>👤 Account</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
              <p style={{ margin: 0 }}><strong>Username:</strong> {user.username}</p>
              <p style={{ margin: 0 }}><strong>Email:</strong> {user.email}</p>
              <p style={{ margin: 0 }}><strong>Timezone:</strong> {user.preferences?.timezone}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SettingsPage;
