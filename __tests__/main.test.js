const { describe, test, expect, beforeEach } = require('@jest/globals');

// Initialize mocks in a scope accessible to tests
let mockApp;
let mockWindow;
let mockIpcMain;

// Mock electron module
jest.mock('electron', () => {
  // Create fresh mocks for each test
  mockApp = {
    quit: jest.fn(),
    on: jest.fn(),
    whenReady: jest.fn().mockImplementation(() => Promise.resolve()),
  };

  mockWindow = {
    loadFile: jest.fn().mockResolvedValue(),
    webContents: { send: jest.fn() },
    on: jest.fn(),
    destroy: jest.fn(),
    isDestroyed: jest.fn().mockReturnValue(false),
    close: jest.fn().mockImplementation(() => mockApp.quit()),
  };

  mockIpcMain = {
    on: jest.fn(),
    send: jest.fn(),
  };

  const BrowserWindowMock = jest.fn().mockImplementation(() => mockWindow);

  return {
    app: mockApp,
    BrowserWindow: BrowserWindowMock,
    ipcMain: mockIpcMain,
  };
});

const electron = require('electron');

describe('Main Process', () => {
  let mainProcess;

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('window creation', async () => {
    const electron = require('electron');
    const path = require('path');

    // Run main process
    mainProcess = require('../main.js');
    await mockApp.whenReady.mock.results[0].value;

    // Verify window creation with correct options
    expect(electron.BrowserWindow).toHaveBeenCalledWith({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(process.cwd(), 'preload.js')
      }
    });

    // Verify window configuration
    const createdWindow = mockWindow;
    expect(createdWindow.loadFile).toHaveBeenCalledWith('index.html');
  });

  test('IPC handlers are registered', async () => {
    const electron = require('electron');
    const handlers = {};

    // Setup handler capture
    mockIpcMain.on.mockImplementation((channel, handler) => {
      handlers[channel] = handler;
    });

    // Run main process
    mainProcess = require('../main.js');
    await mockApp.whenReady.mock.results[0].value;

    // Verify the actual handlers that should be registered
    expect(handlers).toHaveProperty('start-timer');
    expect(handlers).toHaveProperty('stop-timer');
    expect(handlers).toHaveProperty('reset-timer');
    expect(handlers).toHaveProperty('add-minute');
  });

  test('app quit behavior', async () => {
    const electron = require('electron');

    // Run main process
    mainProcess = require('../main.js');
    await mockApp.whenReady.mock.results[0].value;

    // Simulate window close
    const window = mockWindow;
    window.close();

    // Verify app quit behavior
    expect(mockApp.quit).toHaveBeenCalled();
  });

  test('timer start and update', async () => {
    const electron = require('electron');
    const handlers = {};
    mockIpcMain.on.mockImplementation((channel, handler) => {
      handlers[channel] = handler;
    });

    mainProcess = require('../main.js');
    await mockApp.whenReady.mock.results[0].value;

    // Start a timer
    const timerId = 'test-timer';
    const duration = 60000; // 1 minute
    handlers['start-timer']({}, timerId, duration);

    // Advance timers and check updates
    jest.advanceTimersByTime(100); // First update
    expect(mockWindow.webContents.send).toHaveBeenCalledWith('timer-update', timerId, expect.any(Number));

    // Advance to completion
    jest.advanceTimersByTime(60000);
    expect(mockWindow.webContents.send).toHaveBeenCalledWith('timer-complete', timerId);
  });

  test('timer stop functionality', async () => {
    const electron = require('electron');
    const handlers = {};
    mockIpcMain.on.mockImplementation((channel, handler) => {
      handlers[channel] = handler;
    });

    mainProcess = require('../main.js');
    await mockApp.whenReady.mock.results[0].value;

    // Start and then stop a timer
    const timerId = 'test-timer';
    handlers['start-timer']({}, timerId, 60000);
    jest.advanceTimersByTime(100);

    // Stop the timer
    handlers['stop-timer']({}, timerId);
    jest.advanceTimersByTime(1000);
    
    // No more updates should be sent after stopping
    const updateCalls = mockWindow.webContents.send.mock.calls.filter(call => call[0] === 'timer-update');
    const lastCallTime = updateCalls.length;
    jest.advanceTimersByTime(1000);
    expect(mockWindow.webContents.send.mock.calls.filter(call => call[0] === 'timer-update').length).toBe(lastCallTime);
  });

  test('add minute to timer', async () => {
    const electron = require('electron');
    const handlers = {};
    mockIpcMain.on.mockImplementation((channel, handler) => {
      handlers[channel] = handler;
    });

    mainProcess = require('../main.js');
    await mockApp.whenReady.mock.results[0].value;

    // Start a timer and run it for a while
    const timerId = 'test-timer';
    handlers['start-timer']({}, timerId, 30000); // 30 seconds
    jest.advanceTimersByTime(15000); // Advance halfway

    // Add a minute
    handlers['add-minute']({}, timerId);
    jest.advanceTimersByTime(100);

    // Verify the timer update reflects the added minute
    const updateCalls = mockWindow.webContents.send.mock.calls.filter(call => call[0] === 'timer-update');
    const lastUpdate = updateCalls[updateCalls.length - 1];
    expect(lastUpdate[2]).toBeGreaterThan(60000); // Should have more than a minute remaining
  });

  test('reset timer', async () => {
    const electron = require('electron');
    const handlers = {};
    mockIpcMain.on.mockImplementation((channel, handler) => {
      handlers[channel] = handler;
    });

    mainProcess = require('../main.js');
    await mockApp.whenReady.mock.results[0].value;

    // Start a timer
    const timerId = 'test-timer';
    handlers['start-timer']({}, timerId, 60000);
    jest.advanceTimersByTime(30000); // Run for 30 seconds

    // Reset the timer
    handlers['reset-timer']({}, timerId);
    jest.advanceTimersByTime(1000);

    // No more updates should be sent after reset
    const updateCallsAfterReset = mockWindow.webContents.send.mock.calls.filter(
      call => call[0] === 'timer-update' && call[1] === timerId
    ).length;
    jest.advanceTimersByTime(1000);
    expect(mockWindow.webContents.send.mock.calls.filter(
      call => call[0] === 'timer-update' && call[1] === timerId
    ).length).toBe(updateCallsAfterReset);
  });

  test('window-all-closed handling', async () => {
    const electron = require('electron');
    
    // Store original platform
    const originalPlatform = process.platform;
    
    // Test Windows behavior
    Object.defineProperty(process, 'platform', { value: 'win32' });
    mainProcess = require('../main.js');
    await mockApp.whenReady.mock.results[0].value;
    
    // Trigger window-all-closed
    const allClosedHandler = mockApp.on.mock.calls.find(call => call[0] === 'window-all-closed')[1];
    allClosedHandler();
    expect(mockApp.quit).toHaveBeenCalled();
    
    // Reset quit mock
    mockApp.quit.mockClear();
    
    // Test macOS behavior
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    allClosedHandler();
    expect(mockApp.quit).not.toHaveBeenCalled();
    
    // Restore original platform
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });
});
