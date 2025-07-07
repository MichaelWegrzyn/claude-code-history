# Claude Code History Viewer

**Version 0.1.0 - Production Ready** 🚀

A modern desktop application to browse, search, and manage your Claude Code conversation history with a custom embedded title bar and intuitive project navigation.

## ✨ Features

- **Project Discovery** - Automatically scans and displays your Claude Code projects
- **Conversation Browsing** - View conversations with rich metadata (tokens, dates, message counts)  
- **Resume Functionality** - One-click copy resume commands to clipboard
- **Summary Generation** - Intelligent rule-based conversation summaries
- **Export Capabilities** - Export summaries as Markdown files
- **Professional UI** - Modern gradient-based design with glassmorphism effects
- **Local First** - No data ever leaves your machine
- **Cross Platform** - Works on macOS, Windows, and Linux

## 📦 Download

**Ready-to-use releases:**
- **macOS (Apple Silicon)**: [Download Claude Code History Viewer-0.1.0-arm64.dmg](https://github.com/MichaelWegrzyn/claude-code-history/releases/latest/download/Claude%20Code%20History%20Viewer-0.1.0-arm64.dmg)
- **macOS (ZIP)**: [Download Claude Code History Viewer-0.1.0-arm64-mac.zip](https://github.com/MichaelWegrzyn/claude-code-history/releases/latest/download/Claude%20Code%20History%20Viewer-0.1.0-arm64-mac.zip)
- Windows/Linux: Coming soon

> **Note**: On first launch, macOS may show a security warning since the app isn't code-signed. Right-click the app and select "Open" to bypass this warning.

## 🎯 Status

✅ **PRODUCTION READY**
- All core features implemented and tested
- Professional UI with smooth animations
- Memory-efficient streaming JSONL parser
- Comprehensive error handling
- Clean TypeScript codebase

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
- **Project Navigation** - Browse Claude Code conversation history organized by project
- **Custom Title Bar** - Modern embedded title bar with native platform integration
- **Project Search** - Real-time search filtering for quick project discovery
- **Token Tracking** - Monitor usage and costs across all conversations
- **One-Click Resume** - Resume any conversation with a single click
- **Smart Summaries** - Generate intelligent conversation summaries locally
- **Export Capabilities** - Export summaries as markdown files
- **Local-First** - All data processing happens locally for privacy

## Architecture
- **Electron 37+** - Cross-platform desktop app with custom title bar
- **React 18+** - Modern UI with TypeScript for type safety
- **Tailwind CSS 4+** - Utility-first styling with custom design system
- **React Query** - Efficient data fetching and caching
- **Streaming JSONL Parser** - Memory-efficient conversation processing
- **IPC Communication** - Secure inter-process communication for window controls

## Contributing
See CLAUDE.md for development guidelines and standards.

## 🤝 Collaboration

This project was developed through a collaborative effort between:
- **Michael Wegrzyn** - Project Manager & Vision
- **Claude (Anthropic)** - Lead Developer & Implementation

A unique partnership combining human creativity and AI engineering expertise to deliver a polished, production-ready desktop application.