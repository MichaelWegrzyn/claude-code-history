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
├── State Management (Zustand)
├── Virtual Scrolling (react-window)
└── Search (Fuse.js)

Worker Threads
├── JSONL Parser Worker
├── Search Indexer Worker
└── File Watcher Worker (chokidar)
```

### Key Dependencies
```json
{
  "electron": "^28.0.0",
  "react": "^18.2.0",
  "typescript": "^5.3.0",
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-*": "^1.0.0",
  "zustand": "^4.4.0",
  "chokidar": "^3.5.0",
  "fuse.js": "^7.0.0",
  "react-window": "^1.8.0",
  "vite": "^5.0.0"
}
```

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
    logger.error('React error boundary caught:', error, errorInfo);
    // Send to error tracking service in production
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.resetError} />;
    }
    return this.props.children;
  }
}
```

### Async Error Handling
```typescript
// Always handle errors in async operations
async function loadConversations(projectPath: string) {
  try {
    const files = await readdir(projectPath);
    return Promise.all(
      files
        .filter(f => f.endsWith('.jsonl'))
        .map(f => parseJSONLSafely(path.join(projectPath, f)))
    );
  } catch (error) {
    logger.error('Failed to load conversations:', error);
    return [];
  }
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
- **Search response:** < 100ms for 10k conversations
- **Memory usage:** < 200MB baseline
- **UI responsiveness:** 60 FPS scrolling

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
- `/src/main/services/parser.ts` - JSONL parser
- `/src/renderer/stores/conversation.ts` - State management

### Performance Checklist
- [ ] Virtual scrolling for large lists
- [ ] Debounced search input
- [ ] Lazy loading for details
- [ ] Worker threads for heavy operations
- [ ] Streaming for large files

### Security Checklist
- [ ] Context isolation enabled
- [ ] Input validation on all paths
- [ ] No external API calls
- [ ] Sanitized IPC communication
- [ ] Secure file access permissions