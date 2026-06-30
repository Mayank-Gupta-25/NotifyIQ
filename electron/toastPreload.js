const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('toastAPI', {
  onNotificationData: (callback) => {
    ipcRenderer.on('toast:data', (event, data) => callback(data));
  },
  sendAction: (id, action) => {
    ipcRenderer.invoke('toast:action', { id, action });
  }
});
