# 🔍 Fuzzy Tabs

> Lightning-fast fuzzy search for your browser tabs. Find what you need, instantly.

![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Browser](https://img.shields.io/badge/browser-Brave%20%7C%20Chrome-brightgreen.svg)

## ✨ Features

- **⚡ Blazing Fast Search** - Fuzzy search through all your open tabs instantly
- **🎯 Smart Matching** - Searches across tab titles, URLs, and page content
- **⏰ Time Tracking** - See when each tab was opened
- **⌨️ Keyboard First** - Navigate entirely with keyboard shortcuts
- **🎨 Clean Interface** - Beautiful, distraction-free design
- **🔄 Smart Focus** - Reuses existing tab instead of creating duplicates

## 🚀 Quick Start

### Installation

1. Clone this repository or download the ZIP
   ```bash
   git clone https://github.com/pendashteh/fuzzytabs.git
   cd fuzzytabs
   ```

2. Open your browser and navigate to:
   - **Brave/Chrome**: `brave://extensions/` or `chrome://extensions/`

3. Enable **Developer mode** (toggle in top-right corner)

4. Click **Load unpacked** and select the `fuzzytabs` folder

5. Done! Press `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac) to start searching

### Updating

To get the latest version:

1. Pull the latest changes:
   ```bash
   cd fuzzytabs
   git pull origin main
   ```

2. Go to `brave://extensions/` or `chrome://extensions/`

3. Find **Fuzzy Tabs** and click the **reload icon** (🔄)

4. All done! Your extension is now updated

**Alternative Method (if you downloaded ZIP):**
1. Download the latest ZIP from GitHub
2. Extract to the same folder (overwrite existing files)
3. Reload the extension in your browser

## 🎮 Usage

### Opening Fuzzy Tabs

- **Keyboard Shortcut**: `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)
- **Extension Icon**: Click the Fuzzy Tabs icon in your browser toolbar

### Navigation

| Key | Action |
|-----|--------|
| `Type` | Start fuzzy searching |
| `↑` / `↓` | Navigate through results |
| `Enter` | Switch to selected tab |
| `Esc` | Clear search |

### Search Examples

- `gith doc` → Finds "GitHub Documentation"
- `local 3000` → Finds "localhost:3000"
- `trello board` → Finds your Trello boards
- `pdf` → Finds all PDF files

## 📸 Screenshots

### Main Interface
*Search through all your tabs with fuzzy matching*

### Quick Navigation
*Keyboard-first design for maximum productivity*

## 🛠️ Technical Details

### Built With

- Vanilla JavaScript (no dependencies!)
- Chrome Extensions Manifest V3
- CSS3 for modern styling

### Permissions Required

- `tabs` - Access tab information and switch between tabs
- `storage` - Track when tabs were opened

### File Structure

```
fuzzytabs/
├── manifest.json       # Extension configuration
├── background.js       # Background service worker
├── popup.html         # Main interface
├── styles.css         # Styling
├── script.js          # Core functionality
└── README.md          # This file
```

## 🎯 How It Works

1. **Fuzzy Matching Algorithm** - Implements a character-by-character matching algorithm that scores results based on match quality and position
2. **Time Tracking** - Uses Chrome's storage API to persistently track when tabs are opened
3. **Smart Focus** - Checks for existing instances before opening new tabs
4. **Real-time Search** - Updates results as you type with zero lag

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Ideas for Contribution

- [ ] Add tab grouping support
- [ ] Implement tab preview on hover
- [ ] Add bookmarks search
- [ ] Custom keyboard shortcuts
- [ ] Dark/light theme toggle
- [ ] Export tab sessions
- [ ] Multi-window search filters

## 📋 Roadmap

### Version 1.1
- [ ] Search browser history
- [ ] Bookmark integration
- [ ] Tab preview thumbnails

### Version 1.2
- [ ] Tab grouping and organizing
- [ ] Session management
- [ ] Analytics dashboard

### Version 2.0
- [ ] AI-powered recommendations
- [ ] Duplicate tab detection
- [ ] Memory optimization suggestions

## 🐛 Known Issues

- Time tracking resets when browser restarts (planned fix in v1.1)
- Some favicon URLs may not display correctly on localhost

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Idea by a human, labour by AI (Claude Sonnet 4.5)
- Inspired by command palettes in modern IDEs
- Built for productivity enthusiasts and tab hoarders
- Special thanks to the Brave and Chrome extension communities

---

<p align="center">
  Made with ❤️ by developers, for developers
</p>

<p align="center">
  <a href="https://github.com/pendashteh/fuzzytabs">⭐ Star this repo</a> •
  <a href="https://github.com/pendashteh/fuzzytabs/issues">🐛 Report Bug</a> •
  <a href="https://github.com/pendashteh/fuzzytabs/issues">✨ Request Feature</a>
</p>
