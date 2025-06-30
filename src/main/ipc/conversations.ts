import { ipcMain } from 'electron';
import type { ConversationSummary } from '@shared/types/conversation.js';
import { loadConversations, loadConversationDetails } from '../services/conversationLoader.js';

ipcMain.handle('load-conversations', async (_event, projectPath: string) => {
  return await loadConversations(projectPath);
});

ipcMain.handle('load-conversation-details', async (_event, sessionId: string, projectPath: string) => {
  const details = await loadConversationDetails(sessionId, projectPath);
  if (!details) {
    throw new Error(`Conversation ${sessionId} not found`);
  }
  return details;
});

ipcMain.handle('generate-summary', async (_event, conversationId: string, projectPath: string) => {
  // TODO: Implement summary generation
  const mockSummary: ConversationSummary = {
    id: conversationId,
    projectPath,
    generatedAt: new Date(),
    keyDecisions: ['Decision 1', 'Decision 2'],
    solutions: ['Solution 1', 'Solution 2'],
    filesModified: ['file1.ts', 'file2.tsx'],
    summary: 'This is a mock summary',
    markdown: '# Summary\n\nThis is a mock summary',
  };
  
  return mockSummary;
});

ipcMain.handle('watch-project', async (_event, projectPath: string) => {
  // TODO: Implement file watching
  console.log('Watching project:', projectPath);
});

ipcMain.handle('unwatch-project', async (_event, projectPath: string) => {
  // TODO: Implement file watching cleanup
  console.log('Unwatching project:', projectPath);
});