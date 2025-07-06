import path from 'node:path';
import { readdir } from 'node:fs/promises';
import type { ConversationSession } from '@shared/types/conversation.js';
import { parseJSONLFile } from './jsonlParser.js';

// Helper function to determine if a message content is meaningful for use as a title
function isValidTitleContent(content: string): boolean {
  if (!content || content.trim().length < 10) {
    return false;
  }
  
  const cleanContent = content.trim().toLowerCase();
  
  // Filter out system messages and caveats
  if (cleanContent.startsWith('caveat:')) {
    return false;
  }
  
  // Filter out XML/HTML-like command messages
  if (cleanContent.includes('<command-name>') || 
      cleanContent.includes('<command-message>') ||
      cleanContent.includes('<command-args>') ||
      cleanContent.includes('<local-command-stdout>') ||
      cleanContent.includes('</command-name>') ||
      cleanContent.includes('</command-message>') ||
      cleanContent.includes('/clear') ||
      cleanContent.includes('/ide') ||
      cleanContent.includes('(no content)')) {
    return false;
  }
  
  // Filter out messages that are mostly XML tags (more than 30% angle brackets)
  const anglebrackets = (content.match(/[<>]/g) || []).length;
  if (anglebrackets > content.length * 0.3) {
    return false;
  }
  
  // Filter out very short or generic messages
  if (cleanContent.length < 15 || 
      cleanContent === 'help' ||
      cleanContent === 'hi' ||
      cleanContent === 'hello') {
    return false;
  }
  
  return true;
}

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
        
        // Extract first meaningful user message as title
        let title = sessionId; // fallback to session ID
        
        for (const msg of messages) {
          if (msg.type === 'user' && msg.message?.content) {
            let content = '';
            if (typeof msg.message.content === 'string') {
              content = msg.message.content;
            } else if (Array.isArray(msg.message.content)) {
              // Find first text content in array
              const textContent = msg.message.content.find(item => item?.type === 'text');
              content = textContent?.text || '';
            }
            
            const trimmedContent = content?.trim();
            if (trimmedContent && isValidTitleContent(trimmedContent)) {
              // trimmedContent is guaranteed to be string here due to the if condition
              const validContent: string = trimmedContent;
              
              // Clean up the content for use as title
              const firstLine = validContent.split('\n')[0] || validContent;
              const cleanTitle = firstLine
                .slice(0, 60) // Limit length
                .trim();
              
              title = cleanTitle;
              if (validContent.length > 60) {
                title += '...';
              }
              break; // Use the first valid message found
            }
          }
        }
        
        const session = {
          id: sessionId,
          projectPath,
          messages: [], // Don't load all messages initially
          messageCount: messages.length,
          lastActivity,
          totalTokens: tokenUsage.input + tokenUsage.output,
          tokenUsage,
          title,
        };
        
        // Only add sessions that have actual messages
        if (session.messageCount > 0) {
          sessions.push(session);
        }
      } catch (error) {
        console.error(`Error loading conversation ${filePath}:`, error);
      }
    }
    
    // Remove duplicates based on session ID and sort by last activity
    const uniqueSessions = sessions.reduce((acc, session) => {
      const existing = acc.find(s => s.id === session.id);
      if (!existing) {
        acc.push(session);
      } else {
        // Keep the one with more recent activity
        if (session.lastActivity > existing.lastActivity) {
          const index = acc.indexOf(existing);
          acc[index] = session;
        }
      }
      return acc;
    }, [] as ConversationSession[]);

    return uniqueSessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
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

    // Extract first meaningful user message as title
    let title = sessionId; // fallback to session ID
    
    for (const msg of messages) {
      if (msg.type === 'user' && msg.message?.content) {
        let content = '';
        if (typeof msg.message.content === 'string') {
          content = msg.message.content;
        } else if (Array.isArray(msg.message.content)) {
          // Find first text content in array
          const textContent = msg.message.content.find(item => item?.type === 'text');
          content = textContent?.text || '';
        }
        
        const trimmedContent = content?.trim();
        if (trimmedContent && isValidTitleContent(trimmedContent)) {
          // trimmedContent is guaranteed to be string here due to the if condition
          const validContent: string = trimmedContent;
          
          // Clean up the content for use as title
          const firstLine = validContent.split('\n')[0] || validContent;
          const cleanTitle = firstLine
            .slice(0, 60) // Limit length
            .trim();
          
          title = cleanTitle;
          if (validContent.length > 60) {
            title += '...';
          }
          break; // Use the first valid message found
        }
      }
    }

    return {
      id: sessionId,
      projectPath,
      messages,
      messageCount: messages.length,
      lastActivity,
      totalTokens: safeTokenUsage.input + safeTokenUsage.output,
      tokenUsage: safeTokenUsage,
      title,
    };
  } catch (error) {
    console.error(`Error loading conversation details for ${sessionId}:`, error);
    return null;
  }
}