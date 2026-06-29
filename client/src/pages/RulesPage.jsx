import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';

const RulesPage = () => {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({ type: 'keyword', value: '', priority: 'critical' });

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getRules().then(setRules);
    }
  }, []);

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (window.electronAPI) {
      const addedRule = await window.electronAPI.createRule(newRule);
      setRules([...rules, addedRule]);
      setNewRule({ ...newRule, value: '' });
    }
  };

  const handleDeleteRule = async (id) => {
    if (window.electronAPI) {
      await window.electronAPI.deleteRule(id);
      setRules(rules.filter(r => r._id !== id));
    }
  };

  return (
    <>
      <Header title="Triage Rules" subtitle="Custom logic for incoming notifications" />
      
      <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3>Add New Rule</h3>
        <form onSubmit={handleAddRule} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <select value={newRule.type} onChange={e => setNewRule({...newRule, type: e.target.value})} className="input">
            <option value="keyword">Contains Keyword</option>
            <option value="app">From App</option>
          </select>
          <input 
            type="text" className="input" placeholder="Value (e.g. 'urgent', 'Slack')" 
            value={newRule.value} onChange={e => setNewRule({...newRule, value: e.target.value})} required
          />
          <select value={newRule.priority} onChange={e => setNewRule({...newRule, priority: e.target.value})} className="input">
            <option value="critical">Force Critical</option>
            <option value="noise">Force Noise</option>
          </select>
          <button type="submit" className="btn btn-primary">Add Rule</button>
        </form>
      </div>

      <div className="glass" style={{ padding: '2rem' }}>
        <h3>Active Rules ({rules.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {rules.map(rule => (
            <div key={rule._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div>
                <strong>{rule.type === 'keyword' ? 'Keyword' : 'App'}:</strong> {rule.value} 
                <span className={`priority-badge ${rule.priority}`} style={{ marginLeft: '1rem' }}>
                  Force {rule.priority}
                </span>
              </div>
              <button className="btn" onClick={() => handleDeleteRule(rule._id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
export default RulesPage;
