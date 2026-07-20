import { app, BrowserWindow, shell } from 'electron';
import path from 'node:path';
import { initDatabase } from './database';
import { startServer } from './server';

function createWindow() {
  const win = new BrowserWindow({ width: 1440, height: 900, minWidth: 1050, minHeight: 700, backgroundColor: '#080b14', titleBarStyle: 'hidden', titleBarOverlay: { color: '#090d17', symbolColor: '#c8cede', height: 46 }, webPreferences: { contextIsolation: true, nodeIntegration: false } });
  win.webContents.setWindowOpenHandler(({ url }) => { void shell.openExternal(url); return { action: 'deny' } });
  process.env.VITE_DEV_SERVER_URL ? void win.loadURL(process.env.VITE_DEV_SERVER_URL) : void win.loadFile(path.join(__dirname, '../dist/index.html'));
}
app.whenReady().then(async () => { await initDatabase(app.getPath('userData')); startServer(); createWindow(); app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow()) });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() });
