![Red Team Diagram Editor](public/images/banner.png)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Live Demo](https://img.shields.io/badge/demo-live-blue.svg)](https://red.michaelnieto.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![PWA](https://img.shields.io/badge/PWA-enabled-5A0FC8.svg)](https://web.dev/progressive-web-apps/)

A powerful, browser-based Progressive Web App (PWA) for creating and managing red team attack diagrams. Built with React Flow, this application provides an intuitive interface for visualizing attack paths, tactics, and techniques with zero backend dependencies. Install it like a native app and run it completely offline.

**Live Demo:** [red.michaelnieto.com](https://red.michaelnieto.com)

## 📸 Screenshots

### Example Workflow
![Light Theme Example](public/images/example1.png)

### Custom Theme Options
![Theme Example](public/images/example2.png)
![Dark Theme Example](public/images/example3.png)

### Presentation Mode
![Presentation Mode](public/images/presentationmode.gif)

## ✨ Features

### Core Functionality
- **Full-Featured Diagram Editor**: Powered by React Flow with smooth interactions
- **Custom Node Creation**: Add nodes with custom labels, colors, and icons
  - Choose from 65+ professional icons (Shield, Network, Terminal, Cloud, etc.)
  - Full color customization with color picker
  - Any custom label text for your attack stages
- **Flexible Connections**: Connect nodes from any side (top, bottom, left, right)
- **Auto-Save**: Diagrams automatically persist to browser localStorage
- **Import/Export**: Save and load diagrams as JSON files
- **Interactive HTML Export**: Share diagrams as standalone HTML files with full interactivity

### Customization
- **Custom Icons**: 65+ professional icons to choose from for each node
- **Custom Colors**: Full color picker for node customization (including transparent)
- **Background Themes**: Multiple built-in backgrounds (abstract, mountains, nature, night city)
- **Neon Mode**: Toggle cyberpunk-style neon aesthetics
- **Font Customization**: Adjust font family and size
- **Dark/Light Mode**: Seamless theme switching

### Sharing & Export
- **JSON Export**: Export diagrams for backup or re-import
- **Interactive HTML Export**: Generate standalone HTML files that anyone can view with full pan/zoom/attachment viewing
- **AI/LLM Compatible**: Well-documented JSON schema allows AI assistants to generate diagrams programmatically

### Advanced Features
- **Progressive Web App (PWA)**: Install as a native app on desktop or mobile
- **Fully Offline-Capable**: Works 100% offline after installation - perfect for air-gapped environments
- **Attachment Management**: Add images, screenshots, and links to nodes
- **Presentation Mode**: Step through nodes sequentially with keyboard navigation
- **Presentation Order**: Customize the order nodes appear in presentations
- **Responsive Design**: Works on desktop and mobile devices
- **No Backend Required**: Complete client-side application with localStorage and IndexedDB

## 🤖 AI/LLM Integration

This app supports AI-generated diagrams! Any AI assistant (ChatGPT, Claude, Gemini, etc.) can generate valid diagram JSON that you can import directly.

**See the [JSON Schema Documentation](docs/JSON_SCHEMA.md) for complete technical details.**

Quick example prompt for AI:
> "Generate a red team attack diagram JSON for a phishing campaign leading to domain admin compromise"

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite
- **PWA Support**: vite-plugin-pwa + Workbox
- **Diagramming**: React Flow 11
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks + Context API
- **Local Storage**: IndexedDB for attachment persistence
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

### Installing as a PWA

The app can be installed as a Progressive Web App for offline use:

**Desktop (Chrome, Edge, Brave):**
1. Visit the app in your browser
2. Look for the install icon (⊕) in the address bar
3. Click "Install" to add it as a native app
4. Access from your Start Menu or Applications folder

**Mobile (iOS Safari):**
1. Visit the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add" to install

**Mobile (Android Chrome):**
1. Visit the app in Chrome
2. Tap the menu (⋮)
3. Select "Install app" or "Add to Home Screen"
4. Tap "Install"

Once installed, the app works completely offline with all features available.

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── AddNodeDialog.tsx
│   ├── DiagramEditor.tsx
│   ├── Toolbar.tsx
│   └── ...
├── hooks/              # Custom React hooks
├── nodes/              # React Flow custom nodes
├── pages/              # Route pages
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── indexedDB.ts   # Database operations
│   ├── storage.ts     # LocalStorage helpers
│   ├── htmlExport.ts  # Interactive HTML export
│   └── validation.ts  # Schema validation
├── App.tsx             # Main app component
├── index.css           # Global styles & design system
└── main.tsx            # Application entry point

docs/
└── JSON_SCHEMA.md      # Technical JSON schema for AI/LLM integration
```

## 🌐 Deployment

### Option 1: Lovable (Recommended)

The easiest way to deploy this project:

1. Open your [Lovable Project](https://lovable.dev/projects/c6bea9df-92e9-4881-92a3-302e13620985)
2. Click the **Publish** button (top right on desktop, bottom right on mobile)
3. Your app is live instantly!

**Custom Domain Setup:**
- Navigate to Project → Settings → Domains
- Click "Connect Domain"
- Follow the instructions to connect your custom domain
- Requires a paid Lovable plan

### Option 2: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install -D gh-pages
   ```

2. **Add deploy scripts to package.json**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 3: Vercel / Netlify / Static Hosting

Build the project and deploy the `dist` folder:

```bash
npm run build
```

The `dist` folder contains all static files ready for any hosting service.

## 📖 Usage

### Creating Your First Diagram

1. **Add Nodes**: Click "Add Node" in the toolbar
2. **Connect Nodes**: Hover over a node to reveal connection handles, then drag to another node
3. **Customize**: Click nodes to edit labels, icons, colors, and attachments
4. **Present**: Use presentation mode to step through your diagram
5. **Export**: Download as JSON or Interactive HTML to share

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Delete` | Remove selected nodes/edges |
| `Escape` | Exit presentation mode |
| `Arrow Keys` | Navigate nodes in presentation |
| `F` | Toggle fullscreen (presentation) |
| `Home` | Jump to first node (presentation) |
| `End` | Jump to last node (presentation) |

### Sharing Diagrams

**JSON Export** - For backup or re-import:
- Click Export → Export as JSON
- Share the `.json` file with team members

**Interactive HTML Export** - For viewing without the app:
- Click Export → Export as Interactive HTML
- Share the `.html` file - recipients can view with full interactivity

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Creator

**Michael Nieto**

Red team professional and security tool developer.

- LinkedIn: [linkedin.com/in/nietomichael](https://www.linkedin.com/in/nietomichael/)
- Website: [michaelnieto.com](https://michaelnieto.com)

## 🙏 Acknowledgments

Built with:
- [React Flow](https://reactflow.dev/) - Powerful diagram library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component system
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Lucide Icons](https://lucide.dev/) - Elegant icon set
- [Lovable](https://lovable.dev/) - AI-powered development platform

---

**⭐ Star this repo if you find it useful!**

Made with ❤️ for the red team community
