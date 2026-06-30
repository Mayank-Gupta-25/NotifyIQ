const { exec, execSync } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class FocusAssist {
  constructor() {
    this.mode = 'additive'; // Fallback mode
  }

  async enable() {
    try {
      // Turns off Windows Native Banners globally in the Registry
      const cmd = `powershell -Command "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings' -Name 'NOC_GLOBAL_SETTING_TOASTS_ENABLED' -Value 0"`;
      await execAsync(cmd);
      console.log('[Focus Assist] Successfully enabled (Native banners suppressed).');
      this.mode = 'suppressive';
      return true;
    } catch (error) {
      console.warn('[Focus Assist] Failed to enable. Running in additive mode.');
      this.mode = 'additive';
      return false;
    }
  }

  async disable() {
    try {
      // Turns Native Banners back on
      const cmd = `powershell -Command "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings' -Name 'NOC_GLOBAL_SETTING_TOASTS_ENABLED' -Value 1"`;
      await execAsync(cmd);
      console.log('[Focus Assist] Successfully disabled (Native banners restored).');
      return true;
    } catch (error) {
      console.warn('[Focus Assist] Failed to disable.');
      return false;
    }
  }

  // Synchronous version used ONLY during app shutdown
  disableSync() {
    try {
      const cmd = `powershell -Command "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings' -Name 'NOC_GLOBAL_SETTING_TOASTS_ENABLED' -Value 1"`;
      execSync(cmd, { stdio: 'ignore' });
      console.log('[Focus Assist] Cleanup: Native banners restored on exit.');
    } catch (e) {
      // Ignore errors on shutdown
    }
  }

  getFallbackMode() {
    return this.mode;
  }
}

module.exports = new FocusAssist();
