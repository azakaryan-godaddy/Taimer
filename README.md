# Taimer - Multiple Timer Application

A desktop application for managing multiple timers simultaneously, built with Electron by GitHub Copilot
DISCLAIMER: This code was 100% written by AI. There is no guarantee this is good, safe, or even interesting to anyone but me.


## Features

- Create multiple independent timers
- Visual and audio notifications
- Overtime tracking
- Quick timer presets
- Dark/Light theme support
- Cross-platform support (Windows, macOS, Linux)

## Downloads

### Windows
- **Installer**: Download `Taimer-Setup-1.0.0.exe` for a standard installation
- **Portable**: Download `Taimer-Portable-1.0.0.exe` if you want to run without installation

### macOS
- **DMG Installer**: Download `Taimer-1.0.0-arm64.dmg` for Apple Silicon Macs
- **ZIP Archive**: Download `Taimer-1.0.0-arm64-mac.zip` for a portable version

## Installation Instructions

### Windows

#### Using the Installer
1. Download `Taimer-Setup-1.0.0.exe`
2. Double-click the downloaded file
3. Follow the installation wizard
4. Choose your installation directory (optional)
5. Wait for the installation to complete
6. Launch Taimer from the Start Menu or desktop shortcut

#### Using the Portable Version
1. Download `Taimer-Portable-1.0.0.exe`
2. Move the file to your preferred location
3. Double-click to run (no installation needed)

### macOS

#### Using the DMG Installer
1. Download `Taimer-1.0.0-arm64.dmg`
2. Double-click the downloaded file
3. Drag Taimer to the Applications folder
4. Launch Taimer from Applications or Spotlight

#### Using the ZIP Archive
1. Download `Taimer-1.0.0-arm64-mac.zip`
2. Extract the ZIP file
3. Move Taimer.app to Applications (optional)
4. Double-click to run

## Development

### Prerequisites
- Node.js 14 or higher
- npm 6 or higher

### Setup
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm start` to start the application in development mode

### Running Tests
```bash
npm test
```

### Building for Distribution
```bash
# All platforms
npm run dist

# Platform specific
npm run build:mac
npm run build:win
npm run build:linux
```

## License

ISC License
