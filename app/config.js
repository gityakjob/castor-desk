const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class ConfigManager {
  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'app-config.json');
    this.defaults = {
      windowBounds: {
        width: 1200,
        height: 820,
        x: null,
        y: null,
        isMaximized: false
      },
      minimizeToTray: true,
      startMinimized: false,
      globalShortcut: 'Control+Alt+G',
      globalShortcutEnabled: true,
      zoomLevel: 0,
      customCSS: true
    };
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, 'utf8');
        const parsed = JSON.parse(raw);
        return { ...this.defaults, ...parsed };
      }
    } catch (err) {
      console.warn('Failed to read config file, using defaults:', err);
    }
    return { ...this.defaults };
  }

  save() {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
  }
}

module.exports = new ConfigManager();
