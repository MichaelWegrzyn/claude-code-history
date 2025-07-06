import { ipcMain, BrowserWindow } from 'electron';

// Window control handlers
ipcMain.handle('window-minimize', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.close();
  }
});

ipcMain.handle('window-is-maximized', () => {
  const window = BrowserWindow.getFocusedWindow();
  return window ? window.isMaximized() : false;
});

// Listen for window state changes
ipcMain.on('setup-window-listeners', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    const sendMaximizeState = () => {
      event.sender.send('window-maximized-changed', window.isMaximized());
    };

    window.on('maximize', sendMaximizeState);
    window.on('unmaximize', sendMaximizeState);
  }
});