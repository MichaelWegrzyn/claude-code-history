# Claude Code History Viewer

A desktop application to browse, search, and manage your Claude Code conversation history.

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm 8+
- Claude Code installed with conversation history in `~/.claude/`

### Installation
```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev
```

### Building
```bash
# Build for production
pnpm build

# Package for distribution
pnpm package
```

### Project Structure
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
│   └── utils/        # Frontend utilities
├── shared/           # Shared between processes
│   ├── types/        # TypeScript types
│   └── constants/    # Shared constants
└── workers/          # Worker threads
    ├── parser/       # JSONL parser
    └── indexer/      # Search indexer
```

## Features
- View Claude Code conversation history by project
- Track token usage and costs
- Resume conversations with one click
- Generate conversation summaries
- Search across all conversations
- Export summaries as markdown

## Architecture
- **Electron** for cross-platform desktop app
- **React** with TypeScript for the UI
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Virtual scrolling** for performance
- **Worker threads** for JSONL parsing

## Contributing
See CLAUDE.md for development guidelines and standards.