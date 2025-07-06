import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Project operations
  getProjects: () => ipcRenderer.invoke('get-projects'),
  
  // Conversation operations
  loadConversations: (projectPath: string) => 
    ipcRenderer.invoke('load-conversations', projectPath),
  loadConversationDetails: (sessionId: string, projectPath: string) =>
    ipcRenderer.invoke('load-conversation-details', sessionId, projectPath),
  
  // Clipboard operations
  copyToClipboard: (text: string) => 
    ipcRenderer.invoke('copy-to-clipboard', text),
  
  // File watching
  watchProject: (projectPath: string) => 
    ipcRenderer.invoke('watch-project', projectPath),
  unwatchProject: (projectPath: string) => 
    ipcRenderer.invoke('unwatch-project', projectPath),
  
  // Event listeners
  onFileChange: (callback: (data: any) => void) => {
    ipcRenderer.on('file-changed', (_event, data) => callback(data));
  },
  
  // Summary generation
  generateSummary: (conversationId: string, projectPath: string) =>
    ipcRenderer.invoke('generate-summary', conversationId, projectPath),
  
  // Window controls
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // Window state listeners
  onWindowMaximizedChanged: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on('window-maximized-changed', (_event, isMaximized) => callback(isMaximized));
  },
  setupWindowListeners: () => {
    ipcRenderer.send('setup-window-listeners');
  },
});