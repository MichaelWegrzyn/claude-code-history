# Claude Code History Viewer - Development Guidelines

## Project Overview

Claude Code History Viewer is a desktop application that provides developers with a comprehensive interface to view, analyze, and manage their Claude Code conversation history. This tool addresses the need for developers to track AI-assisted development sessions, understand usage patterns, and seamlessly continue previous conversations.

**Core Features:**
- Browse and search Claude Code conversation history
- Track token usage and costs
- Generate conversation summaries
- Resume previous sessions with one click
- Local-first architecture (no data leaves your machine)

**Target Users:** Solo developers using Claude Code for AI-assisted development

**Reference:** See `claude-code-viewer-prd.md` for detailed product requirements

## Architecture & Technical Stack

### Core Technologies
- **Framework:** Electron 28+ with context isolation
- **Frontend:** React 18+ with TypeScript 5+
- **Styling:** Tailwind CSS 3+ with Radix UI components
- **State Management:** Zustand 4+ with persistence
- **Build Tool:** Vite 5+ for fast development
- **Package Manager:** pnpm for efficient dependency management

### Process Architecture
```
Main Process (Electron)
├── File System Operations (Node.js fs/promises)
├── IPC Communication (contextBridge)
├── Window Management
└── Auto-updater

Renderer Process (React)
├── UI Components
├── State Management (React Query)
├── Error Boundaries
└── Toast Notifications

Services (Main Process)
├── JSONL Parser (Streaming)
├── Conversation Loader
├── Project Scanner
└── Summary Generator
```

### Key Dependencies
```json
{
  "electron": "^37.1.0",
  "react": "^18.2.0",
  "typescript": "^5.3.0",
  "tailwindcss": "^4.0.0",
  "@radix-ui/react-*": "^1.0.0",
  "@tanstack/react-query": "^5.0.0",
  "vite": "^7.0.0",
  "concurrently": "^9.0.0"
}
```

**Note**: Search functionality was removed from MVP to focus on core features.

## Code Standards & Conventions

### TypeScript Configuration
```typescript
// tsconfig.json requirements
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### File Structure
```
src/
├── main/              # Electron main process
│   ├── ipc/          # IPC handlers
│   ├── services/     # Business logic
│   └── utils/        # Utilities
├── renderer/         # React application
│   ├── components/   # UI components
│   ├── hooks/        # Custom React hooks
│   ├── stores/       # Zustand stores
│   ├── utils/        # Frontend utilities
│   └── types/        # TypeScript types
├── shared/           # Shared between processes
│   ├── types/        # Common types
│   └── constants/    # Shared constants
└── workers/          # Worker threads
    ├── parser/       # JSONL parser
    └── indexer/      # Search indexer
```

### Naming Conventions
- **Files:** camelCase (e.g., `conversationViewer.tsx`)
- **Components:** PascalCase (e.g., `ConversationViewer`)
- **Hooks:** use prefix (e.g., `useConversationData`)
- **Types/Interfaces:** PascalCase with descriptive names
- **Constants:** UPPER_SNAKE_CASE
- **CSS Classes:** Tailwind utilities only (no custom CSS)

### React Best Practices
```typescript
// Always use functional components with TypeScript
interface ConversationCardProps {
  sessionId: string;
  projectPath: string;
  messageCount: number;
  tokenUsage: TokenUsage;
}

export function ConversationCard({ 
  sessionId, 
  projectPath, 
  messageCount, 
  tokenUsage 
}: ConversationCardProps) {
  // Use early returns for conditional rendering
  if (!sessionId) return null;

  // Memoize expensive computations
  const totalTokens = useMemo(() => 
    calculateTotalTokens(tokenUsage), 
    [tokenUsage]
  );

  return (
    <div className="rounded-lg border p-4 hover:shadow-md transition-shadow">
      {/* Component content */}
    </div>
  );
}
```

### State Management Patterns
```typescript
// Zustand store with TypeScript
interface ConversationStore {
  conversations: Conversation[];
  selectedProject: string | null;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  loadConversations: (projectPath: string) => Promise<void>;
  selectProject: (projectPath: string) => void;
  clearError: () => void;
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      selectedProject: null,
      isLoading: false,
      error: null,

      loadConversations: async (projectPath) => {
        set({ isLoading: true, error: null });
        try {
          const data = await window.api.loadConversations(projectPath);
          set({ conversations: data, isLoading: false });
        } catch (error) {
          set({ error: error as Error, isLoading: false });
        }
      },

      selectProject: (projectPath) => {
        set({ selectedProject: projectPath });
        get().loadConversations(projectPath);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'conversation-store',
      partialize: (state) => ({ selectedProject: state.selectedProject }),
    }
  )
);
```

## Performance Guidelines

### 1. Virtual Scrolling
Always use virtual scrolling for lists with 50+ items:
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  width="100%"
  itemCount={conversations.length}
  itemSize={80}
  overscanCount={5}
>
  {ConversationRow}
</FixedSizeList>
```

### 2. Streaming JSONL Parser
Never load entire JSONL files into memory:
```typescript
// Use streaming parser in worker thread
async function* parseJSONLStream(filePath: string) {
  const stream = createReadStream(filePath, { encoding: 'utf8' });
  let buffer = '';

  for await (const chunk of stream) {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        yield JSON.parse(line);
      }
    }
  }
}
```

### 3. Debounced Search
Implement search with debouncing:
```typescript
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    searchWorker.postMessage({ type: 'search', query });
  }, 300),
  []
);
```

### 4. Lazy Loading
Load conversation details only when needed:
```typescript
const { data: conversationDetails } = useQuery({
  queryKey: ['conversation', sessionId],
  queryFn: () => window.api.loadConversationDetails(sessionId),
  enabled: isConversationSelected,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## Security Guidelines

### 1. Context Isolation
Always use context isolation in Electron:
```typescript
// main/preload.ts
contextBridge.exposeInMainWorld('api', {
  loadConversations: (path: string) => 
    ipcRenderer.invoke('load-conversations', path),
  // Never expose Node.js APIs directly
});
```

### 2. Input Validation
Validate all file paths and user inputs:
```typescript
function validateProjectPath(path: string): boolean {
  const normalizedPath = path.normalize(path);
  const claudeDir = path.join(os.homedir(), '.claude');
  return normalizedPath.startsWith(claudeDir);
}
```

### 3. No External Communication
Never send conversation data to external servers:
```typescript
// ❌ Never do this
await fetch('https://api.example.com/analyze', {
  body: JSON.stringify(conversationData)
});

// ✅ All processing happens locally
const summary = await generateLocalSummary(conversationData);
```

## Testing Requirements

### Unit Tests (Vitest)
```typescript
// Test file naming: component.test.ts
describe('ConversationParser', () => {
  it('should parse valid JSONL data', async () => {
    const result = await parseJSONL(mockFilePath);
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty('sessionId');
  });

  it('should handle malformed JSON gracefully', async () => {
    const result = await parseJSONL(malformedFilePath);
    expect(result.errors).toHaveLength(1);
  });
});
```

### Integration Tests
```typescript
// Test IPC communication
describe('IPC Handlers', () => {
  it('should load conversations from valid directory', async () => {
    const result = await ipcRenderer.invoke(
      'load-conversations', 
      testProjectPath
    );
    expect(result).toBeInstanceOf(Array);
  });
});
```

### E2E Tests (Playwright)
```typescript
test('user can resume conversation', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="project-item"]');
  await page.click('[data-testid="conversation-card"]');
  await page.click('[data-testid="resume-button"]');
  
  const clipboard = await page.evaluate(() => 
    navigator.clipboard.readText()
  );
  expect(clipboard).toMatch(/claude \/resume \w+/);
});
```

## Build & Deployment

### Development Commands
```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Run tests
pnpm test
pnpm test:e2e

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build for production
pnpm build

# Package for distribution
pnpm package
```

### Electron Builder Configuration
```javascript
// electron-builder.config.js
module.exports = {
  appId: 'com.claudecode.historyviewer',
  productName: 'Claude Code History Viewer',
  directories: {
    output: 'dist',
  },
  files: [
    'dist/**/*',
    'node_modules/**/*',
    'package.json',
  ],
  mac: {
    category: 'public.app-category.developer-tools',
    hardenedRuntime: true,
    entitlements: 'build/entitlements.mac.plist',
    notarize: {
      teamId: process.env.APPLE_TEAM_ID,
    },
  },
  win: {
    target: 'nsis',
    sign: process.env.WIN_CERT_PATH,
  },
  linux: {
    target: ['AppImage', 'snap', 'deb'],
    category: 'Development',
  },
};
```

## Error Handling

### Global Error Boundary
```typescript
class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center p-8 bg-gradient-to-br from-red-50 to-red-100">
          <div className="text-center max-w-md">
            <h3 className="text-xl font-semibold text-red-800 mb-3">Something went wrong</h3>
            <p className="text-red-600 leading-relaxed mb-6">
              An unexpected error occurred. Please try refreshing or contact support.
            </p>
            <button onClick={this.handleRetry} className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-6 py-2.5 text-sm font-medium text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105">
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### Critical Bug Fixes Applied

#### 1. Usage Property Undefined Errors
**Problem**: `TypeError: Cannot read properties of undefined (reading 'usage')`

**Root Causes & Fixes**:
- Frontend access: `message.message.usage` → `message.message?.usage?.output_tokens`
- Token display: `session.tokenUsage.input` → `session.tokenUsage?.input?.toLocaleString() || '0'`
- Summary generation: Added fallback `const tokenUsage = analysis.tokenUsage || { input: 0, output: 0, cache: 0 }`

#### 2. Navigation Blank Screen Bug
**Problem**: Empty string `''` treated as valid session ID
**Fix**: Added proper validation `selectedSessionId && selectedSessionId.trim()`

#### 3. Symbol.iterator Errors
**Problem**: Unsafe array operations causing iteration errors
**Fix**: Replaced spread operators with safe for-loops and added array validation

### Async Error Handling
```typescript
// Always handle errors in async operations with comprehensive validation
async function loadConversations(projectPath: string) {
  try {
    if (!projectPath || typeof projectPath !== 'string') {
      throw new Error('Invalid project path provided');
    }
    
    const files = await readdir(projectPath);
    return Promise.all(
      files
        .filter(f => f.endsWith('.jsonl'))
        .map(f => parseJSONLSafely(path.join(projectPath, f)))
    );
  } catch (error) {
    console.error('Failed to load conversations:', error);
    throw error; // Re-throw to let UI handle with error boundaries
  }
}
```

### Message Content Safety
```typescript
// Safe message content access with fallbacks
function MessageContent({ content }: MessageContentProps) {
  if (!content) {
    return (
      <div className="prose prose-sm max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-500 italic">
          No content available
        </pre>
      </div>
    );
  }

  if (typeof content === 'string') {
    return <pre className="whitespace-pre-wrap">{content}</pre>;
  }

  if (!Array.isArray(content)) {
    return <pre className="text-gray-500 italic">Invalid content format</pre>;
  }

  return (
    <div className="space-y-3">
      {content.map((item, index) => {
        if (!item) return null;
        // Render item safely...
      })}
    </div>
  );
}
```

## Accessibility Requirements

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Focus indicators must be visible
- Tab order must be logical

### Screen Reader Support
```typescript
<button
  aria-label="Resume conversation"
  aria-describedby="resume-help"
  onClick={handleResume}
>
  Resume
</button>
<span id="resume-help" className="sr-only">
  Copy resume command to clipboard
</span>
```

### Color Contrast
- Minimum WCAG AA compliance (4.5:1 for normal text)
- Provide high contrast theme option

## Performance Benchmarks

Target metrics:
- **Startup time:** < 3 seconds
- **File parsing:** > 1000 messages/second  
- **Memory usage:** < 200MB baseline
- **UI responsiveness:** 60 FPS scrolling
- **Build time:** < 30 seconds for production

**Note**: Search was removed from MVP to optimize performance and focus on core features.

## Common Patterns

### Worker Thread Communication
```typescript
// main/workers/parser.worker.ts
self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'parse':
      try {
        const result = await parseJSONLStream(payload.filePath);
        self.postMessage({ type: 'parse-complete', result });
      } catch (error) {
        self.postMessage({ type: 'parse-error', error });
      }
      break;
  }
});
```

### IPC Bridge Pattern
```typescript
// main/ipc/conversations.ts
ipcMain.handle('load-conversations', async (event, projectPath) => {
  // Validate input
  if (!validateProjectPath(projectPath)) {
    throw new Error('Invalid project path');
  }
  
  // Perform operation
  const conversations = await conversationService.load(projectPath);
  
  // Return sanitized data
  return conversations.map(sanitizeConversation);
});
```

## Debugging

### Development Tools
- React DevTools for component debugging
- Redux DevTools for Zustand state inspection
- Chrome DevTools for performance profiling

### Logging Strategy
```typescript
// Use structured logging
logger.info('Conversation loaded', {
  sessionId,
  messageCount,
  tokenUsage,
  duration: performance.now() - startTime,
});
```

---

## Quick Reference

### Key Commands
- `pnpm dev` - Start development
- `pnpm test` - Run tests
- `pnpm typecheck` - Check types
- `pnpm lint` - Run linter
- `pnpm build` - Build for production

### Important Files
- `/claude-code-viewer-prd.md` - Product requirements
- `/src/shared/types/conversation.ts` - Core data types
- `/src/main/services/jsonlParser.ts` - Streaming JSONL parser
- `/src/main/services/conversationLoader.ts` - Conversation data loading
- `/src/main/services/summaryGenerator.ts` - AI-free summary generation
- `/src/renderer/components/ErrorBoundary.tsx` - Error handling
- `/PROJECT_LOG.md` - Development progress tracking

### Performance Checklist
- [x] Streaming JSONL parser for large files
- [x] Lazy loading for conversation details
- [x] React Query for efficient data fetching
- [x] Optimized re-renders with proper memoization
- [x] Error boundaries to prevent crashes
- [ ] Virtual scrolling for large lists (future enhancement)

### Security Checklist
- [x] Context isolation enabled
- [x] Input validation on all IPC calls
- [x] No external API calls (fully local)
- [x] Sanitized IPC communication
- [x] Secure file access permissions
- [x] No data leaves user's machine