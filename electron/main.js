const { app, BrowserWindow } = require('electron');
const path = require('path');
const registerIpcHandlers = require('./ipcHandlers');
const { createTray } = require('./tray');
const autoLaunch = require('./autoLaunch');

let mainWindow;
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  // Check if Windows booted us silently
  const isHidden = process.argv.includes('--hidden');

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false, // Wait until React loads to prevent visual flash
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    mainWindow.loadURL('http://localhost:5173');
    
    if (!isHidden) {
      mainWindow.webContents.openDevTools();
    }

    mainWindow.once('ready-to-show', () => {
      // Only show the window if we weren't booted by Windows startup
      if (!isHidden) mainWindow.show();
    });

    // Close-to-Tray behavior
    mainWindow.on('close', (event) => {
      if (!app.isQuitting) {
        event.preventDefault();
        mainWindow.hide();
      }
    });
  }

  app.whenReady().then(() => {
    registerIpcHandlers();
    autoLaunch.init();
    createWindow();
    createTray(mainWindow);

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('before-quit', () => {
    app.isQuitting = true;
  });

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
  });
}
