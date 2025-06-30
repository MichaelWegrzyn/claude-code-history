import { ipcMain, clipboard } from 'electron';

ipcMain.handle('copy-to-clipboard', async (_event, text: string) => {
  clipboard.writeText(text);
});