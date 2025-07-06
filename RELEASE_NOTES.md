# Claude Code History Viewer - Release Notes

## Version 0.1.0 - Initial Release (January 6, 2025)

🎉 **First production-ready release of Claude Code History Viewer!**

### 🚀 What's New

**Core Features**
- **Project Discovery** - Automatically finds and lists your Claude Code projects
- **Conversation Browsing** - Browse all conversations with rich metadata
- **Resume Functionality** - One-click copy resume commands to clipboard
- **Summary Generation** - Intelligent, rule-based conversation summaries
- **Export Capabilities** - Export summaries as Markdown files
- **Search & Filter** - Find projects quickly with real-time search

**User Interface**
- **Modern Design** - Professional gradient-based UI with glassmorphism effects
- **Custom Title Bar** - Native-feeling window controls on all platforms
- **Loading States** - Beautiful skeleton loading animations
- **Error Handling** - Graceful error states with retry functionality
- **Toast Notifications** - Immediate feedback for user actions

**Technical Excellence**
- **Memory Efficient** - Streaming JSONL parser handles large conversation files
- **Local First** - No data ever leaves your machine
- **Fast Performance** - Optimized React components with proper memoization
- **Cross Platform** - Works on macOS, Windows, and Linux

### 🛠️ Technical Details

**Built With**
- Electron 37+ for desktop application framework
- React 18+ with TypeScript for the user interface
- Tailwind CSS 4+ for styling
- React Query for efficient data fetching
- Zustand for state management

**Security**
- Context isolation enabled
- No external API calls
- Input validation on all operations
- Secure file system access

### 📦 Installation

Download the appropriate file for your platform:
- **macOS**: `Claude Code History Viewer-0.1.0-arm64.dmg`
- **macOS (ZIP)**: `Claude Code History Viewer-0.1.0-arm64-mac.zip`

### 🐛 Known Issues

- Code signing certificates not configured (you may see a security warning on first launch)
- Some ESLint warnings present (does not affect functionality)
- Virtual scrolling not implemented yet (performance may be slower with 100+ conversations)

### 🔮 What's Next (v0.2.0 Roadmap)

- **Performance**: Virtual scrolling for large lists
- **Search v2**: More powerful search with full-text capabilities  
- **File Watching**: Real-time updates when new conversations are created
- **Analytics**: Usage patterns and productivity insights
- **Code Signing**: Remove security warnings

### 🙏 Feedback

This is an initial release focused on core functionality. Please report any issues or feature requests!

---

**System Requirements**
- macOS 10.15+ (Catalina)
- Windows 10+
- Linux (Ubuntu 18.04+ or equivalent)
- Node.js 18+ (for development)

**File Size**
- macOS DMG: ~150MB
- Contains all necessary dependencies