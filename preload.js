const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// specific electron APIs without exposing the entire API
contextBridge.exposeInMainWorld(
    'electron',
    {
        startTimer: (timerId, duration) => ipcRenderer.send('start-timer', timerId, duration),
        stopTimer: (timerId) => ipcRenderer.send('stop-timer', timerId),
        resetTimer: (timerId) => ipcRenderer.send('reset-timer', timerId),
        addMinute: (timerId) => ipcRenderer.send('add-minute', timerId),
        onTimerUpdate: (callback) => ipcRenderer.on('timer-update', callback),
        onTimerComplete: (callback) => ipcRenderer.on('timer-complete', callback)
    }
);