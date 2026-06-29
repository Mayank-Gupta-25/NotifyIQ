const { app } = require('electron');
const Store = require('electron-store');
const store = new Store();

function init() {
  const isEnabled = store.get('launchOnStartup', false);
  set(isEnabled); // Sync OS registry with store on boot
}

function set(enabled) {
  store.set('launchOnStartup', enabled);
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: process.execPath,
    args: ['--hidden'] // Crucial: tells the app to start silently
  });
}

function get() {
  return store.get('launchOnStartup', false);
}

module.exports = { init, set, get };
