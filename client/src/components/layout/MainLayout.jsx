import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-area">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
