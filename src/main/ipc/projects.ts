import { ipcMain } from 'electron';
import { scanProjects } from '../services/projectScanner.js';

ipcMain.handle('get-projects', async () => {
  try {
    return await scanProjects();
  } catch (error) {
    console.error('Error scanning projects:', error);
    throw error;
  }
});