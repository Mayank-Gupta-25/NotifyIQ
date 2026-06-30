const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Notifications
  getNotifications: (filters) => ipcRenderer.invoke('notifications:getAll', filters),
  updateNotificationStatus: (id, status) => ipcRenderer.invoke('notifications:updateStatus', id, status),
  onNewNotification: (callback) => {
    const listener = (event, notif) => callback(notif);
    ipcRenderer.on('notifications:new', listener);
    return () => ipcRenderer.removeListener('notifications:new', listener);
  },
  
  // Rules
  getRules: () => ipcRenderer.invoke('rules:getAll'),
  createRule: (rule) => ipcRenderer.invoke('rules:create', rule),
  deleteRule: (id) => ipcRenderer.invoke('rules:delete', id),

  // User & Settings
  getUserPreferences: () => ipcRenderer.invoke('user:getPreferences'),
  updateUserPreferences: (prefs) => ipcRenderer.invoke('user:updatePreferences', prefs),
  getLaunchOnStartup: () => ipcRenderer.invoke('settings:getLaunchOnStartup'),
  setLaunchOnStartup: (enabled) => ipcRenderer.invoke('settings:setLaunchOnStartup', enabled),
  getListenerStatus: () => ipcRenderer.invoke('settings:getListenerStatus'),
  setListenerEnabled: (enabled) => ipcRenderer.invoke('settings:setListenerEnabled', enabled),

  // Digest
  getLatestDigest: () => ipcRenderer.invoke('digest:getLatest'),
  generateDigest: () => ipcRenderer.invoke('digest:generate'),

  // Analytics
  getAnalyticsSummary: () => ipcRenderer.invoke('analytics:getSummary'),
  getAnalyticsTrends: () => ipcRenderer.invoke('analytics:getTrends'),

  // Simulator
  startSimulation: (speed) => ipcRenderer.invoke('simulator:start', speed),
  stopSimulation: () => ipcRenderer.invoke('simulator:stop'),
  sendOneNotification: () => ipcRenderer.invoke('simulator:sendOne'),

  // Tray events
  onFocusChanged: (callback) => {
    const listener = (event, mode) => callback(mode);
    ipcRenderer.on('focus:changed', listener);
    return () => ipcRenderer.removeListener('focus:changed', listener);
  }
});
