import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { homedir } from 'node:os';
import type { Project, ConversationSession } from '@shared/types/conversation.js';
import { parseJSONLFile } from './jsonlParser.js';

export async function scanProjects(): Promise<Project[]> {
  const claudeDir = path.join(homedir(), '.claude', 'projects');
  const projects: Project[] = [];
  
  try {
    const entries = await readdir(claudeDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectPath = path.join(claudeDir, entry.name);
        const project = await scanProject(projectPath);
        if (project) {
          projects.push(project);
        }
      }
    }
  } catch (error) {
    console.error('Error scanning Claude projects directory:', error);
  }
  
  return projects.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
}

async function scanProject(projectPath: string): Promise<Project | null> {
  try {
    const files = await readdir(projectPath);
    const jsonlFiles = files.filter(f => f.endsWith('.jsonl'));
    
    if (jsonlFiles.length === 0) {
      return null;
    }
    
    let totalTokens = 0;
    let lastActivity = new Date(0);
    let actualProjectPath: string | undefined;
    const sessions: ConversationSession[] = [];
    
    for (const file of jsonlFiles) {
      const filePath = path.join(projectPath, file);
      const sessionId = file.replace('.jsonl', '');
      
      try {
        await stat(filePath);
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
        
        const sessionTotalTokens = tokenUsage.input + tokenUsage.output;
        totalTokens += sessionTotalTokens;
        
        // Extract actual project path from message cwd (use the most recent one)
        if (!actualProjectPath && messages.length > 0) {
          const recentMessage = messages[messages.length - 1];
          if (recentMessage?.cwd) {
            actualProjectPath = recentMessage.cwd;
          }
        }
        
        // Get last activity from the last message
        const lastMessage = messages[messages.length - 1];
        const messageDate = new Date(lastMessage?.timestamp || new Date().toISOString());
        if (messageDate > lastActivity) {
          lastActivity = messageDate;
        }
        
        sessions.push({
          id: sessionId,
          projectPath,
          messages: [], // Don't store all messages in memory
          messageCount: messages.length,
          lastActivity: messageDate,
          totalTokens: sessionTotalTokens,
          tokenUsage,
        });
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
      }
    }
    
    if (sessions.length === 0) {
      return null;
    }
    
    return {
      path: projectPath,
      actualProjectPath,
      name: path.basename(projectPath),
      conversationCount: sessions.length,
      lastActivity,
      totalTokens,
      sessions: sessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()),
    };
  } catch (error) {
    console.error(`Error scanning project ${projectPath}:`, error);
    return null;
  }
}