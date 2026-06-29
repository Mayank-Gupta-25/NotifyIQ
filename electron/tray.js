const autoLaunch  = require('./autoLaunch.js');
const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

// Icon paths
const ICON_DEFAULT = path.join(__dirname, 'assets', 'bell_default_32.png');
const ICON_ALERT   = path.join(__dirname, 'assets', 'bell_alert_32.png');

let tray = null;
let mainWindowRef = null;

/**
 * Creates and initializes the system tray.
 * @param {BrowserWindow} mainWindow - Reference to the main Electron window.
 */
function createTray(mainWindow) {
  mainWindowRef = mainWindow;

  // Build the tray icon from the PNG file
  const defaultIcon = nativeImage.createFromPath(ICON_DEFAULT);
  tray = new Tray(defaultIcon);
  tray.setToolTip('NotifyIQ — Smart Notification Triage');

  // Build the context menu
  _buildContextMenu();

  // LEFT-CLICK: toggle main window visibility
  tray.on('click', () => {
    if (mainWindowRef.isVisible()) {
      mainWindowRef.hide();
    } else {
      mainWindowRef.show();
      mainWindowRef.focus();
    }
  });

  return tray;
}

/**
 * Rebuilds and sets the tray context menu.
 * Called on creation and whenever "Launch on Startup" is toggled.
 */
function _buildContextMenu() {
  const launchOnStartup = autoLaunch.get();

  const contextMenu = Menu.buildFromTemplate([
    { label: 'NotifyIQ', enabled: false },
    { type: 'separator' },
    {
      label: 'Show Dashboard',
      click: () => {
        if (mainWindowRef) {
          mainWindowRef.show();
          mainWindowRef.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Focus Mode',
      submenu: [
        { label: '🌐 Open — All notifications', type: 'radio', checked: true, click: () => _setFocusMode('open') },
        { label: '💼 Work — Critical only', type: 'radio', checked: false, click: () => _setFocusMode('work') },
        { label: '🏠 Personal — Important & above', type: 'radio', checked: false, click: () => _setFocusMode('personal') },
        { label: '🔕 Do Not Disturb — None', type: 'radio', checked: false, click: () => _setFocusMode('dnd') }
      ]
    },
    { type: 'separator' },
    {
      label: 'Launch on Startup',
      type: 'checkbox',
      checked: launchOnStartup,
      click: (menuItem) => {
        autoLaunch.set(menuItem.checked);
        _buildContextMenu();
      }
    },
    { type: 'separator' },
    { label: 'Quit NotifyIQ', role: 'quit' }
  ]);

  tray.setContextMenu(contextMenu);
}

function rebuildContextMenu() {
  _buildContextMenu();
}


/**
 * Switches the tray icon between normal and alert (critical notification exists).
 * Called from ipcHandlers whenever a CRITICAL notification is saved.
 * @param {boolean} hasAlert - true = show alert icon, false = default icon
 */
function setAlertState(hasAlert) {
  if (!tray) return;
  const iconPath = hasAlert ? ICON_ALERT : ICON_DEFAULT;
  const icon = nativeImage.createFromPath(iconPath);
  tray.setImage(icon);
  tray.setToolTip(
    hasAlert
      ? 'NotifyIQ — ⚠️ Critical notification waiting!'
      : 'NotifyIQ — Smart Notification Triage'
  );
}

/**
 * Sends focus mode preference to the DB via UserRepo.
 * @param {string} mode - One of: 'open', 'work', 'personal', 'dnd'
 */
function _setFocusMode(mode) {
  try {
    const UserRepo = require('../server/src/database/userRepo');
    UserRepo.updatePreferences('user_001', { focusMode: mode });
    console.log(`[Tray] Focus mode set to: ${mode}`);
  } catch (err) {
    console.error('[Tray] Failed to set focus mode:', err);
  }
  // Notify the React window so the Settings UI updates live
  if (mainWindowRef && !mainWindowRef.isDestroyed()) {
    mainWindowRef.webContents.send('focus:changed', mode);
  }
}

module.exports = { createTray, setAlertState, rebuildContextMenu };
