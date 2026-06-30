const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

const TOAST_WIDTH = 360;
const TOAST_HEIGHT = 140; // 120 height + 20 margin
const TOAST_MARGIN = 16;
const MAX_VISIBLE = 4;

let activeToasts = [];

class ToastRenderer {
  static spawnToast(notification) {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    // Create frameless transparent window
    const toastWin = new BrowserWindow({
      width: TOAST_WIDTH,
      height: TOAST_HEIGHT,
      x: width - TOAST_WIDTH, 
      y: this._calculateY(height),
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      show: false, // We use showInactive() to prevent stealing keyboard focus!
      webPreferences: {
        preload: path.join(__dirname, '..', 'toastPreload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    const toastPath = path.join(__dirname, '..', '..', 'client', 'toast.html');
    toastWin.loadFile(toastPath);

    toastWin.once('ready-to-show', () => {
      toastWin.webContents.send('toast:data', notification);
      toastWin.showInactive(); 
    });

    activeToasts.push(toastWin);
    
    // Manage stack (remove oldest if overflow)
    if (activeToasts.length > MAX_VISIBLE) {
      const oldest = activeToasts.shift();
      if (!oldest.isDestroyed()) oldest.close();
      this._repositionAll(height);
    }

    toastWin.on('closed', () => {
      activeToasts = activeToasts.filter(w => w !== toastWin);
      this._repositionAll(height);
    });
  }

  static _calculateY(screenHeight) {
    const stackHeight = activeToasts.length * TOAST_HEIGHT;
    return screenHeight - TOAST_HEIGHT - TOAST_MARGIN - stackHeight;
  }

  static _repositionAll(screenHeight) {
    activeToasts.forEach((win, index) => {
      if (!win.isDestroyed()) {
        const y = screenHeight - TOAST_HEIGHT - TOAST_MARGIN - (index * TOAST_HEIGHT);
        win.setBounds({ x: win.getBounds().x, y: y, width: TOAST_WIDTH, height: TOAST_HEIGHT });
      }
    });
  }
}

module.exports = ToastRenderer;
