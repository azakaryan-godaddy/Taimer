const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (process.platform === 'win32') {
    try {
        if (require('electron-squirrel-startup')) {
            app.quit();
        }
    } catch (e) {
        console.log('Squirrel startup check skipped:', e.message);
    }
}

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// Enable live reload for development
if (process.env.NODE_ENV === 'development') {
    try {
        require('electron-reloader')(module);
    } catch {}
}

let mainWindow;
const timers = new Map();

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 300,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'build', 'icons', process.platform === 'darwin' ? 'icon.icns' : process.platform === 'win32' ? 'icon.ico' : '512x512.png'),
        show: false, // Don't show until ready
        backgroundColor: '#ffffff'
    });

    // Load the index.html file
    mainWindow.loadFile('index.html');

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
        app.quit();
    });

    // Handle errors
    mainWindow.webContents.on('crashed', () => {
        const options = {
            type: 'error',
            title: 'Process Crashed',
            message: 'This process has crashed.',
            buttons: ['Reload', 'Close']
        };
        
        mainWindow.destroy();
        createWindow();
    });
}

// Timer management
function updateTimer(timerId) {
    const timer = timers.get(timerId);
    if (timer && timer.running) {
        const now = Date.now();
        timer.remainingTime -= (now - timer.lastUpdate);
        timer.lastUpdate = now;

        if (timer.remainingTime <= 0) {
            mainWindow.webContents.send('timer-complete', timerId);
            if (!timer.overtime) {
                timer.overtime = true;
                // Only show notification on initial completion
                try {
                    new Notification({
                        title: 'Timer Complete',
                        body: 'Your timer has finished!',
                        icon: path.join(__dirname, 'build', 'icons', process.platform === 'darwin' ? '128x128.png' : '64x64.png'),
                        silent: false
                    }).show();
                } catch (e) {
                    console.log('Notification failed:', e);
                }
            }
        }

        mainWindow.webContents.send('timer-update', timerId, timer.remainingTime);
        timer.timeoutId = setTimeout(() => updateTimer(timerId), 100);
    }
}

// IPC handlers
ipcMain.on('start-timer', (event, timerId, duration) => {
    const timer = {
        running: true,
        remainingTime: duration,
        lastUpdate: Date.now(),
        overtime: false
    };
    timers.set(timerId, timer);
    updateTimer(timerId);
});

ipcMain.on('stop-timer', (event, timerId) => {
    const timer = timers.get(timerId);
    if (timer) {
        timer.running = false;
        if (timer.timeoutId) {
            clearTimeout(timer.timeoutId);
        }
    }
});

ipcMain.on('reset-timer', (event, timerId) => {
    timers.delete(timerId);
});

ipcMain.on('add-minute', (event, timerId) => {
    const timer = timers.get(timerId);
    if (timer) {
        timer.remainingTime += 60000; // Add one minute in milliseconds
    }
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});