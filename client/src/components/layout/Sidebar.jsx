import { NavLink } from 'react-router-dom';

const Sidebar = () => {

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span style={{ fontSize: '1.5rem' }}>🔔</span>
        <h2>NotifyIQ</h2>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-title">Main</span>
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="link-icon">📥</span>
          Live Feed
        </NavLink>
        <NavLink to="/digest" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="link-icon">🗞️</span>
          Daily Digest
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="link-icon">📊</span>
          Analytics
        </NavLink>

        <span className="sidebar-section-title">Configuration</span>
        <NavLink to="/rules" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="link-icon">📜</span>
          Rules
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="link-icon">⚙️</span>
          Settings
        </NavLink>

        <span className="sidebar-section-title">Tools</span>
        <NavLink to="/simulator" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="link-icon">🧪</span>
          Simulator
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="status-dot online" />
          Local System Live
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
