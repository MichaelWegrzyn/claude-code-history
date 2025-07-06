import type { Project, ConversationSession, ConversationSummary } from '@shared/types/conversation';

declare global {
  interface Window {
    api: {
      // Project operations
      getProjects: () => Promise<Project[]>;
      
      // Conversation operations
      loadConversations: (projectPath: string) => Promise<ConversationSession[]>;
      loadConversationDetails: (sessionId: string, projectPath: string) => Promise<ConversationSession>;
      
      // Clipboard operations
      copyToClipboard: (text: string) => Promise<void>;
      
      // File watching
      watchProject: (projectPath: string) => Promise<void>;
      unwatchProject: (projectPath: string) => Promise<void>;
      
      // Event listeners
      onFileChange: (callback: (data: any) => void) => void;
      
      // Summary generation
      generateSummary: (conversationId: string, projectPath: string) => Promise<ConversationSummary>;
      
      // Window controls
      windowMinimize: () => Promise<void>;
      windowMaximize: () => Promise<void>;
      windowClose: () => Promise<void>;
      windowIsMaximized: () => Promise<boolean>;
      
      // Window state listeners
      onWindowMaximizedChanged: (callback: (isMaximized: boolean) => void) => void;
      setupWindowListeners: () => void;
    };
  }
}

export {};