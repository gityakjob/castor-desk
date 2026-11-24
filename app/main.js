const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  MenuItem,
  globalShortcut,
  shell,
  session,
  ipcMain,
  nativeTheme
} = require('electron');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let tray = null;
let isQuitting = false;

// Standard browser User-Agent definitions for web compatibility
const AUTH_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';
const DESKTOP_UA = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome || '140.0.7339.249'} Safari/537.36`;

app.userAgentFallback = DESKTOP_UA;

// Setup Autostart File Path
const autostartDir = path.join(app.getPath('home'), '.config', 'autostart');
const autostartFile = path.join(autostartDir, 'castor-desk.desktop');

function isAutostartEnabled() {
  return fs.existsSync(autostartFile);
}

function setAutostart(enable) {
  try {
    if (enable) {
      if (!fs.existsSync(autostartDir)) {
        fs.mkdirSync(autostartDir, { recursive: true });
      }
      const desktopEntry = `[Desktop Entry]
Type=Application
Name=Castor Desk
Comment=Unofficial Desktop Client for Google Gemini
Exec=castor-desk --start-minimized
Icon=castor-desk
Terminal=false
Categories=Network;Utility;
StartupNotify=false
X-GNOME-Autostart-enabled=true
`;
      fs.writeFileSync(autostartFile, desktopEntry, 'utf8');
    } else {
      if (fs.existsSync(autostartFile)) {
        fs.unlinkSync(autostartFile);
      }
    }
  } catch (err) {
    console.error('Failed to update autostart:', err);
  }
}

function saveWindowBounds() {
  if (!mainWindow) return;
  try {
    const isMaximized = mainWindow.isMaximized();
    if (!isMaximized) {
      const bounds = mainWindow.getBounds();
      config.set('windowBounds', {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        isMaximized: false
      });
    } else {
      const oldBounds = config.get('windowBounds');
      config.set('windowBounds', {
        ...oldBounds,
        isMaximized: true
      });
    }
  } catch (err) {
    console.warn('Failed to save window bounds:', err);
  }
}

function isGeminiHost(urlStr) {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    return host === 'gemini.google.com' || host.endsWith('.gemini.google.com');
  } catch (e) {
    return false;
  }
}

// Helper to determine if a URL belongs to internal app navigation or sign-in flow
function isInternalHost(urlStr) {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();

    // Primary Gemini application
    if (host === 'gemini.google.com' || host.endsWith('.gemini.google.com')) {
      return true;
    }

    // Standard Google Sign-In hosts
    if (
      host === 'accounts.google.com' ||
      host.endsWith('.accounts.google.com') ||
      host === 'myaccount.google.com' ||
      host.endsWith('.myaccount.google.com') ||
      host === 'accounts.youtube.com' ||
      host.endsWith('.accounts.youtube.com') ||
      host === 'passkeys.google.com' ||
      host.endsWith('.passkeys.google.com') ||
      host === 'ogs.google.com' ||
      host.endsWith('.googleusercontent.com') ||
      host.endsWith('.gstatic.com')
    ) {
      return true;
    }

    // Google base domain during sign-in redirect flow
    if (host === 'google.com' || host.endsWith('.google.com')) {
      if (
        parsed.pathname.startsWith('/accounts') ||
        parsed.pathname.startsWith('/signin') ||
        parsed.pathname.startsWith('/ServiceLogin') ||
        parsed.pathname.startsWith('/CheckCookie') ||
        parsed.pathname.startsWith('/SetSID') ||
        parsed.pathname.startsWith('/oauth')
      ) {
        return true;
      }
    }

    return false;
  } catch (e) {
    return false;
  }
}

// Helper to determine if a request belongs to the authentication endpoint
function isAuthRequest(urlStr) {
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();

    if (host === 'gemini.google.com' || host.endsWith('.gemini.google.com')) {
      return false;
    }

    return (
      host === 'accounts.google.com' ||
      host.endsWith('.accounts.google.com') ||
      host === 'accounts.youtube.com' ||
      host.endsWith('.accounts.youtube.com') ||
      host === 'myaccount.google.com' ||
      host.endsWith('.myaccount.google.com') ||
      host === 'passkeys.google.com' ||
      u.pathname.includes('/SetSID') ||
      u.pathname.includes('/CheckCookie')
    );
  } catch (e) {
    return false;
  }
}

function createMainWindow() {
  const savedBounds = config.get('windowBounds') || {};
  const width = savedBounds.width || 1200;
  const height = savedBounds.height || 820;

  mainWindow = new BrowserWindow({
    width,
    height,
    x: savedBounds.x || undefined,
    y: savedBounds.y || undefined,
    minWidth: 500,
    minHeight: 400,
    title: 'Castor Desk',
    icon: path.join(__dirname, '../assets/icon.png'),
    backgroundColor: '#131314', // Matches Gemini dark mode
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      spellcheck: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (savedBounds.isMaximized) {
    mainWindow.maximize();
  }

  // Handle Permissions strictly for gemini.google.com
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const targetUrl = (details && details.requestingUrl) || (webContents && webContents.getURL()) || '';
    const allowed = [
      'media',
      'microphone',
      'camera',
      'video',
      'notifications',
      'clipboard-read',
      'clipboard-sanitized-write',
      'fullscreen'
    ];
    if (isGeminiHost(targetUrl) && allowed.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Load Google Gemini
  mainWindow.loadURL('https://gemini.google.com/app');

  // Show window when ready
  const startMinimized = process.argv.includes('--start-minimized') || config.get('startMinimized');
  mainWindow.once('ready-to-show', () => {
    if (!startMinimized) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Handle external links vs internal auth
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      
      // Allow Google Sign-in popup
      if (
        host === 'accounts.google.com' ||
        host.endsWith('.accounts.google.com') ||
        host === 'myaccount.google.com' ||
        host.endsWith('.myaccount.google.com') ||
        host === 'accounts.youtube.com' ||
        host.endsWith('.accounts.youtube.com') ||
        host === 'passkeys.google.com' ||
        (host.endsWith('.google.com') && (parsed.pathname.includes('/auth') || parsed.pathname.includes('/signin')))
      ) {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            title: 'Google Sign-In',
            autoHideMenuBar: true,
            webPreferences: {
              nodeIntegration: false,
              contextIsolation: true,
              sandbox: true
            }
          }
        };
      }

      // If user navigates inside Gemini
      if (host === 'gemini.google.com' || host.endsWith('.gemini.google.com')) {
        mainWindow.loadURL(url);
        return { action: 'deny' };
      }

      // All external sites (sources, links in chats) open in default system browser
      shell.openExternal(url);
      return { action: 'deny' };
    } catch (e) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
  });

  // Intercept top-level navigation: keep auth and Gemini internal, open external sites in system browser
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isInternalHost(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Also protect child/popup windows during auth flow
  mainWindow.webContents.on('did-create-window', (childWindow) => {
    childWindow.webContents.on('will-navigate', (event, url) => {
      if (!isInternalHost(url)) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });
  });

  // Context Menu
  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = new Menu();

    if (params.linkURL) {
      menu.append(new MenuItem({
        label: 'Copiar enlace',
        click: () => {
          require('electron').clipboard.writeText(params.linkURL);
        }
      }));
      menu.append(new MenuItem({
        label: 'Abrir enlace en el navegador',
        click: () => {
          shell.openExternal(params.linkURL);
        }
      }));
      menu.append(new MenuItem({ type: 'separator' }));
    }

    if (params.isEditable) {
      menu.append(new MenuItem({ role: 'undo', label: 'Deshacer' }));
      menu.append(new MenuItem({ role: 'redo', label: 'Rehacer' }));
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({ role: 'cut', label: 'Cortar' }));
      menu.append(new MenuItem({ role: 'copy', label: 'Copiar' }));
      menu.append(new MenuItem({ role: 'paste', label: 'Pegar' }));
      menu.append(new MenuItem({ role: 'selectAll', label: 'Seleccionar todo' }));
    } else {
      if (params.selectionText) {
        menu.append(new MenuItem({ role: 'copy', label: 'Copiar selección' }));
        menu.append(new MenuItem({ type: 'separator' }));
      }
      menu.append(new MenuItem({
        label: 'Nuevo chat',
        click: () => mainWindow.loadURL('https://gemini.google.com/app')
      }));
      menu.append(new MenuItem({
        label: 'Recargar',
        click: () => mainWindow.webContents.reload()
      }));
    }

    menu.popup();
  });

  // Window Close Event (minimize to tray if configured)
  mainWindow.on('close', (event) => {
    if (!isQuitting && config.get('minimizeToTray')) {
      event.preventDefault();
      saveWindowBounds();
      mainWindow.hide();
      return false;
    }
    saveWindowBounds();
  });

  // Window Resize/Move Bounds Saving
  mainWindow.on('resize', () => saveWindowBounds());
  mainWindow.on('move', () => saveWindowBounds());

  createAppMenu();
}

function toggleWindow() {
  if (!mainWindow) {
    createMainWindow();
    return;
  }

  if (mainWindow.isVisible()) {
    if (mainWindow.isFocused()) {
      mainWindow.hide();
    } else {
      mainWindow.focus();
    }
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function createAppMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nuevo chat',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) mainWindow.loadURL('https://gemini.google.com/app');
          }
        },
        { type: 'separator' },
        {
          label: 'Ocultar en la bandeja',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            if (mainWindow) mainWindow.hide();
          }
        },
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Deshacer' },
        { role: 'redo', label: 'Rehacer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Pegar' },
        { role: 'selectAll', label: 'Seleccionar todo' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        {
          role: 'reload',
          label: 'Recargar',
          accelerator: 'CmdOrCtrl+R'
        },
        {
          role: 'forceReload',
          label: 'Forzar recarga',
          accelerator: 'CmdOrCtrl+Shift+R'
        },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Tamaño original' },
        { role: 'zoomIn', label: 'Acercar' },
        { role: 'zoomOut', label: 'Alejar' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla completa' },
        {
          label: 'Herramientas de desarrollador',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Configuración',
      submenu: [
        {
          label: 'Minimizar a la bandeja al cerrar',
          type: 'checkbox',
          checked: config.get('minimizeToTray'),
          click: (item) => {
            config.set('minimizeToTray', item.checked);
            updateTrayMenu();
          }
        },
        {
          label: 'Iniciar minimizado con el sistema',
          type: 'checkbox',
          checked: isAutostartEnabled(),
          click: (item) => {
            setAutostart(item.checked);
            updateTrayMenu();
          }
        },
        {
          label: 'Atajo global activo (Ctrl+Alt+G)',
          type: 'checkbox',
          checked: config.get('globalShortcutEnabled'),
          click: (item) => {
            config.set('globalShortcutEnabled', item.checked);
            registerGlobalShortcut();
            updateTrayMenu();
          }
        },
        { type: 'separator' },
        {
          label: 'Limpiar caché y reiniciar',
          click: async () => {
            if (mainWindow) {
              await session.defaultSession.clearCache();
              mainWindow.webContents.reload();
            }
          }
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de Castor Desk',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de Castor Desk',
              message: 'Castor Desk para CachyOS / Linux',
              detail: `Versión: 1.0.0\nElectron: ${process.versions.electron}\nChromium: ${process.versions.chrome}\nNode.js: ${process.versions.node}\n\nCliente de escritorio comunitario no oficial para Google Gemini en Linux. No afiliado ni respaldado por Google LLC.`,
              buttons: ['Aceptar']
            });
          }
        },
        {
          label: 'Sitio oficial de Google Gemini',
          click: () => {
            shell.openExternal('https://gemini.google.com');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function updateTrayMenu() {
  if (!tray) return;

  const isVisible = mainWindow && mainWindow.isVisible();
  const contextMenu = Menu.buildFromTemplate([
    {
      label: isVisible ? 'Ocultar Castor Desk' : 'Abrir Castor Desk',
      click: () => toggleWindow()
    },
    {
      label: 'Nuevo chat',
      accelerator: 'CmdOrCtrl+N',
      click: () => {
        if (!mainWindow) createMainWindow();
        mainWindow.show();
        mainWindow.loadURL('https://gemini.google.com/app');
      }
    },
    { type: 'separator' },
    {
      label: 'Minimizar al cerrar',
      type: 'checkbox',
      checked: config.get('minimizeToTray'),
      click: (item) => {
        config.set('minimizeToTray', item.checked);
        createAppMenu();
      }
    },
    {
      label: 'Iniciar con el sistema',
      type: 'checkbox',
      checked: isAutostartEnabled(),
      click: (item) => {
        setAutostart(item.checked);
        createAppMenu();
      }
    },
    {
      label: 'Atajo global (Ctrl+Alt+G)',
      type: 'checkbox',
      checked: config.get('globalShortcutEnabled'),
      click: (item) => {
        config.set('globalShortcutEnabled', item.checked);
        registerGlobalShortcut();
        createAppMenu();
      }
    },
    { type: 'separator' },
    {
      label: 'Recargar',
      click: () => {
        if (mainWindow) mainWindow.webContents.reload();
      }
    },
    {
      label: 'Salir',
      accelerator: 'CmdOrCtrl+Q',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function createTray() {
  const trayIconPath = path.join(__dirname, '../assets/icon-tray-32.png');
  tray = new Tray(trayIconPath);
  tray.setToolTip('Castor Desk');

  tray.on('click', () => {
    toggleWindow();
  });

  updateTrayMenu();
}

function registerGlobalShortcut() {
  globalShortcut.unregisterAll();

  if (config.get('globalShortcutEnabled')) {
    const shortcut = config.get('globalShortcut') || 'Control+Alt+G';
    try {
      const success = globalShortcut.register(shortcut, () => {
        toggleWindow();
      });
      if (!success) {
        console.warn(`Failed to register global shortcut: ${shortcut}`);
      }
    } catch (err) {
      console.error('Error registering global shortcut:', err);
    }
  }
}

// App lifecycle
app.whenReady().then(() => {
  // Configure standard User-Agent headers for web application compatibility
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const isAuth = isAuthRequest(details.url);
    const targetUA = isAuth ? AUTH_UA : DESKTOP_UA;

    const requestHeaders = {};
    for (const [key, value] of Object.entries(details.requestHeaders)) {
      const lower = key.toLowerCase();
      if (lower === 'user-agent') continue;
      if (isAuth && lower.startsWith('sec-ch-ua')) continue;
      if (lower === 'x-electron') continue;
      requestHeaders[key] = value;
    }
    requestHeaders['User-Agent'] = targetUA;
    callback({ requestHeaders });
  });

  createMainWindow();
  createTray();
  registerGlobalShortcut();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !config.get('minimizeToTray')) {
    app.quit();
  }
});
