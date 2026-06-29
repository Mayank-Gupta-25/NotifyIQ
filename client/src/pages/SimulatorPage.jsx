import { useState } from 'react';
import Header from '../components/layout/Header';

const SimulatorPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(3000);

  const toggleSimulation = async () => {
    if (window.electronAPI) {
      if (isRunning) {
        await window.electronAPI.stopSimulation();
        setIsRunning(false);
      } else {
        await window.electronAPI.startSimulation(speed);
        setIsRunning(true);
      }
    }
  };

  const sendSingle = async () => {
    if (window.electronAPI) {
      await window.electronAPI.sendOneNotification();
    }
  };

  return (
    <>
      <Header title="Simulator" subtitle="Test the triage engine with dummy data" />
      <div className="glass" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={toggleSimulation} className={`btn ${isRunning ? '' : 'btn-primary'}`} style={{ flex: 1 }}>
            {isRunning ? '⏹ Stop Stream' : '▶ Start Stream'}
          </button>
          <button onClick={sendSingle} className="btn" disabled={isRunning}>
            Send Single 📨
          </button>
        </div>
        <div>
          <label>Simulation Speed: {speed / 1000}s</label>
          <input 
            type="range" min="500" max="10000" step="500" 
            value={speed} onChange={e => setSpeed(Number(e.target.value))}
            style={{ width: '100%', marginTop: '1rem' }}
          />
        </div>
      </div>
    </>
  );
};
export default SimulatorPage;
