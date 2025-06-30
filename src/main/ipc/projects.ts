import { ipcMain } from 'electron';
import { scanProjects } from '../services/projectScanner.js';

ipcMain.handle('get-projects', async () => {
  return await scanProjects();
});