import path from 'node:path';
import { readdir } from 'node:fs/promises';
import type { ConversationSession } from '@shared/types/conversation.js';
import { parseJSONLFile } from './jsonlParser.js';

export async function loadConversations(projectPath: string): Promise<ConversationSession[]> {
  try {
    const files = await readdir(projectPath);
    const jsonlFiles = files.filter(f => f.endsWith('.jsonl'));
    
    const sessions: ConversationSession[] = [];
    
    for (const file of jsonlFiles) {
      const filePath = path.join(projectPath, file);
      const sessionId = file.replace('.jsonl', '');
      
      try {
        const messages = await parseJSONLFile(filePath);
        if (messages.length === 0) continue;
        
        // Calculate token usage
        const tokenUsage = {
          input: 0,
          output: 0,
          cache: 0,
        };
        
        for (const msg of messages) {
          if (msg.message && msg.message.usage) {
            tokenUsage.input += msg.message.usage.input_tokens || 0;
            tokenUsage.output += msg.message.usage.output_tokens || 0;
            tokenUsage.cache += msg.message.usage.cache_read_input_tokens || 0;
          }
        }
        
        const lastMessage = messages[messages.length - 1];
        const lastActivity = new Date(lastMessage?.timestamp || new Date().toISOString());
        
        sessions.push({
          id: sessionId,
          projectPath,
          messages: [], // Don't load all messages initially
          messageCount: messages.length,
          lastActivity,
          totalTokens: tokenUsage.input + tokenUsage.output,
          tokenUsage,
        });
      } catch (error) {
        console.error(`Error loading conversation ${filePath}:`, error);
      }
    }
    
    return sessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  } catch (error) {
    console.error(`Error loading conversations from ${projectPath}:`, error);
    return [];
  }
}

export async function loadConversationDetails(
  sessionId: string, 
  projectPath: string
): Promise<ConversationSession | null> {
  try {
    const filePath = path.join(projectPath, `${sessionId}.jsonl`);
    const messages = await parseJSONLFile(filePath);
    
    if (messages.length === 0) {
      return null;
    }
    
    // Calculate token usage
    const tokenUsage = {
      input: 0,
      output: 0,
      cache: 0,
    };
    
    for (const msg of messages) {
      if (msg.message && msg.message.usage) {
        tokenUsage.input += msg.message.usage.input_tokens || 0;
        tokenUsage.output += msg.message.usage.output_tokens || 0;
        tokenUsage.cache += msg.message.usage.cache_read_input_tokens || 0;
      }
    }
    
    const lastMessage = messages[messages.length - 1];
    const lastActivity = new Date(lastMessage?.timestamp || new Date().toISOString());
    
    // Ensure tokenUsage has all required properties
    const safeTokenUsage = {
      input: tokenUsage.input || 0,
      output: tokenUsage.output || 0,
      cache: tokenUsage.cache || 0,
    };

    return {
      id: sessionId,
      projectPath,
      messages,
      messageCount: messages.length,
      lastActivity,
      totalTokens: safeTokenUsage.input + safeTokenUsage.output,
      tokenUsage: safeTokenUsage,
    };
  } catch (error) {
    console.error(`Error loading conversation details for ${sessionId}:`, error);
    return null;
  }
}