import { ipcMain } from 'electron';
import { loadConversations, loadConversationDetails } from '../services/conversationLoader.js';
import { summaryGenerator } from '../services/summaryGenerator.js';

ipcMain.handle('load-conversations', async (_event, projectPath: string) => {
  try {
    if (!projectPath || typeof projectPath !== 'string') {
      throw new Error('Invalid project path provided');
    }
    return await loadConversations(projectPath);
  } catch (error) {
    console.error('Error loading conversations:', error);
    throw error;
  }
});

ipcMain.handle('load-conversation-details', async (_event, sessionId: string, projectPath: string) => {
  try {
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('Invalid session ID provided');
    }
    if (!projectPath || typeof projectPath !== 'string') {
      throw new Error('Invalid project path provided');
    }
    
    const details = await loadConversationDetails(sessionId, projectPath);
    if (!details) {
      throw new Error(`Conversation ${sessionId} not found in ${projectPath}`);
    }
    return details;
  } catch (error) {
    console.error('Error loading conversation details:', error);
    throw error;
  }
});

ipcMain.handle('generate-summary', async (_event, conversationId: string, projectPath: string) => {
  try {
    // Load the conversation details
    const session = await loadConversationDetails(conversationId, projectPath);
    
    if (!session) {
      throw new Error(`Conversation ${conversationId} not found in ${projectPath}`);
    }
    
    // Generate the summary
    const summary = summaryGenerator.generateSummary(session);
    
    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
});

ipcMain.handle('watch-project', async (_event, projectPath: string) => {
  // TODO: Implement file watching
  console.log('Watching project:', projectPath);
});

ipcMain.handle('unwatch-project', async (_event, projectPath: string) => {
  // TODO: Implement file watching cleanup
  console.log('Unwatching project:', projectPath);
});