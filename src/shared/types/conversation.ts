export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  service_tier: string;
}

export interface MessageContent {
  type: 'text' | 'image' | 'tool_use' | 'tool_result';
  text?: string;
  name?: string;
  id?: string;
  input?: any;
  content?: string | MessageContent[];
  is_error?: boolean;
}

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  model?: string;
  content: string | MessageContent[];
  usage?: TokenUsage;
}

export interface ClaudeMessage {
  uuid: string;
  parentUuid: string | null;
  sessionId: string;
  cwd: string;
  version: string;
  timestamp: string;
  type: 'user' | 'assistant';
  isSidechain: boolean;
  userType: string;
  message: Message;
  requestId?: string;
}

export interface ConversationSession {
  id: string;
  projectPath: string;
  messages: ClaudeMessage[];
  messageCount: number;
  lastActivity: Date;
  totalTokens: number;
  tokenUsage: {
    input: number;
    output: number;
    cache: number;
  };
  title?: string;
}

export interface Project {
  path: string; // Path to conversation directory (.claude/projects/...)
  actualProjectPath?: string; // Path to actual project directory
  name: string;
  conversationCount: number;
  lastActivity: Date;
  totalTokens: number;
  sessions: ConversationSession[];
}

export interface ConversationSummary {
  id: string;
  projectPath: string;
  generatedAt: Date;
  keyDecisions: string[];
  solutions: string[];
  filesModified: string[];
  summary: string;
  markdown: string;
}