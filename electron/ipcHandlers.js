const { ipcMain } = require('electron');
const NotificationRepo = require('../server/src/database/notificationRepo');
const UserRepo = require('../server/src/database/userRepo');
const RuleRepo = require('../server/src/database/ruleRepo');
const DigestRepo = require('../server/src/database/digestRepo');
const BehaviorRepo = require('../server/src/database/behaviorRepo');
const DeliveryManager = require('../server/src/services/deliveryManager');
const Simulator = require('../server/src/services/notificationSimulator');

function registerIpcHandlers() {
  // Notifications
  ipcMain.handle('notifications:getAll', (_, filters) => NotificationRepo.getAll(filters));
  ipcMain.handle('notifications:updateStatus', (_, id, status) => NotificationRepo.updateStatus(id, status));
  
  // Rules
  ipcMain.handle('rules:getAll', () => RuleRepo.getAll());
  ipcMain.handle('rules:create', (_, rule) => RuleRepo.create(rule));
  ipcMain.handle('rules:delete', (_, id) => RuleRepo.delete(id));

  // User Settings
  ipcMain.handle('user:getPreferences', () => UserRepo.getPreferences());
  ipcMain.handle('user:updatePreferences', (_, prefs) => UserRepo.updatePreferences('user_001', prefs));
  
  // Auto Launch Settings
  const autoLaunch = require('./autoLaunch');
  const { rebuildContextMenu } = require('./tray');
  ipcMain.handle('settings:getLaunchOnStartup', () => autoLaunch.get());
  ipcMain.handle('settings:setLaunchOnStartup', (_, enabled) => {
    autoLaunch.set(enabled);
    rebuildContextMenu(); // Keeps the tray menu synced with React!
    return { success: true };
  });
  
  // Digest
  ipcMain.handle('digest:getLatest', () => DigestRepo.getLatest());
  ipcMain.handle('digest:generate', async () => {
    const DigestGenerator = require('../server/src/services/digestGenerator');
    return await DigestGenerator.generateDailyDigest('user_001');
  });
  // Analytics
  ipcMain.handle('analytics:getSummary', () => {
    const AnalyticsRepo = require('../server/src/database/analyticsRepo');
    return AnalyticsRepo.getSummary();
  });
  
  ipcMain.handle('analytics:getTrends', () => {
    const AnalyticsRepo = require('../server/src/database/analyticsRepo');
    return AnalyticsRepo.getTrends();
  });

  // Simulator helper
  const processSimulation = async (rawNotif) => {
    try {
      const ClassificationEngine = require('../server/src/services/classificationEngine');
      const rules = RuleRepo.getAll('user_001');
      const { priority, score, explanation } = await ClassificationEngine.classify(rawNotif, rules, 'user_001');
      
      const processedNotif = {
        ...rawNotif,
        priority,
        score,
        explanation
      };
      
      DeliveryManager.deliver(processedNotif);
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  // Simulator controls
  ipcMain.handle('simulator:start', (_, speedMs) => {
    Simulator.start(speedMs, processSimulation);
    return { success: true };
  });
  
  ipcMain.handle('simulator:stop', () => {
    Simulator.stop();
    return { success: true };
  });

  ipcMain.handle('simulator:sendOne', async () => {
    const rawNotif = Simulator.generateOne();
    await processSimulation(rawNotif);
    return { success: true };
  });
}

module.exports = registerIpcHandlers;
