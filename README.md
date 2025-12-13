# Telos Mobile

> Create and maintain your personal or organizational context files using AI, right from your phone.

Telos Mobile brings the powerful [Telos Framework](https://github.com/danielmiessler/telos) by Daniel Miessler to iOS and Android. Build deep, structured context about yourself or your organization through natural conversation with Claude AI, with full control over every change.

## What is Telos?

Telos is a framework for creating "deep context" - a comprehensive understanding of who you are, what you're trying to achieve, and how you're going to get there. It uses structured markdown files that connect:

**Problems** → **Mission** → **Narratives** → **Goals** → **Challenges** → **Strategies** → **Projects** → **Journal**

This creates complete transparency, mapping all your work back to the fundamental problems you're solving.

## Why Telos Mobile?

- **AI-Powered**: Chat naturally with Claude AI to build and refine your context files
- **Always Available**: Update your goals, journal progress, or reflect on challenges wherever you are
- **Full Control**: Review and approve every change with a clean diff view before it's applied
- **Beautiful Interface**: Dracula-themed UI that's easy on the eyes during long reflection sessions
- **Private & Secure**: Your API key and files stay on your device

## Key Features

✅ **Intelligent Conversations**
- Natural chat interface powered by Claude AI
- Context-aware suggestions based on your Telos file
- Specialized prompts for different aspects of your context

✅ **Safe Editing**
- Approve or reject every proposed change
- Clear diff view shows exactly what will change
- Edit suggestions before accepting them

✅ **Complete Telos Support**
- Full template for all Telos sections
- Guided onboarding for new users
- Quick actions for common updates

✅ **Mobile-First Design**
- Works offline (except AI features)
- Fast, native performance
- Beautiful Dracula theme

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/TheOutdoorProgrammer/telos.git
cd telos

# Install dependencies
npm install

# Start the development server
npm start

# Run on your device
# Scan the QR code with Expo Go app
# OR run on simulator:
npm run ios     # iOS
npm run android # Android
```

### Setup

1. **Get a Claude API Key**
   - Sign up at [console.anthropic.com](https://console.anthropic.com)
   - Create an API key
   - Keep it secure - you'll enter it in the app

2. **Configure the App**
   - Open Settings in the app
   - Enter your Claude API key
   - Select your preferred model
   - Test the connection

3. **Create Your First Telos File**
   - Tap the + button
   - Choose "Start with Template" for a guided experience
   - Or start blank if you're familiar with Telos

4. **Start Conversing**
   - Open your file and tap Chat
   - Ask Claude to help you define your mission
   - Review and approve suggestions
   - Build your context iteratively

## Quick Actions

The app includes specialized prompts for common Telos workflows:

- **Onboarding**: First-time setup and initial context creation
- **Journal Entry**: Quick capture of daily progress and reflections
- **Goal Review**: Analyze progress and adjust strategies
- **Challenge Analysis**: Break down obstacles and find solutions
- **Mission Clarity**: Refine your core purpose and direction

*System prompts powered by [Fabric](https://github.com/danielmiessler/fabric) by Daniel Miessler.*

## Requirements

- iOS 13+ or Android 5+
- Claude API key (from [Anthropic](https://console.anthropic.com))
- Internet connection for AI features

## Tech Stack

- **Framework**: Expo (React Native)
- **AI**: Claude API by Anthropic
- **UI**: React Native Paper with Dracula theme
- **Storage**: Local filesystem with secure key storage
- **Language**: TypeScript

## Privacy & Security

- Your API key is stored securely on your device using encrypted storage
- Telos files are saved locally on your device
- No data is sent to servers other than Anthropic's API for AI features
- You can export/import files at any time

## Contributing

Contributions are welcome! This project aims to make Telos accessible to everyone on mobile with an excellent user experience.

### Development Setup

See the installation instructions above to get started. The codebase is TypeScript with clear separation of concerns:

- `app/` - Screen components and navigation
- `services/` - API integration and file operations
- `stores/` - State management
- `prompts/` - Specialized system prompts for different workflows
- `components/` - Reusable UI components

## Roadmap

- ✅ Core Telos file management
- ✅ Claude AI integration with streaming
- ✅ Diff-based approval flow
- 🚧 Enhanced quick actions and specialized prompts
- 📋 Export/import functionality
- 📋 Multiple file management
- 📋 Reminders and periodic review prompts
- 📋 Goal progress visualization

## License

MIT License - Free and open source

## Credits & Acknowledgments

This project builds on the incredible work of:

- **[Telos Framework](https://github.com/danielmiessler/telos)** by Daniel Miessler - The core framework for structured context
- **[Fabric](https://github.com/danielmiessler/fabric)** by Daniel Miessler - System prompts and AI interaction patterns
- **[Dracula Theme](https://draculatheme.com/)** - The beautiful color scheme
- **[Anthropic](https://www.anthropic.com/)** - Claude AI that powers the conversations

## Links

- [Telos Framework](https://github.com/danielmiessler/telos) - Learn about the Telos methodology
- [Fabric](https://github.com/danielmiessler/fabric) - AI prompt patterns and system prompts
- [Daniel Miessler's Blog](https://danielmiessler.com/) - More about context and AI-augmented thinking

---

**Built with ❤️ for the Telos community**
