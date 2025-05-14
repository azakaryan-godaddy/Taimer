// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
};

// Mock window methods and properties
global.window = {
  ...global.window,
  matchMedia: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
};

// Mock Electron's IPC functionality
const mockIpcRenderer = {
  on: jest.fn(),
  send: jest.fn(),
};

const mockIpcMain = {
  on: jest.fn(),
  send: jest.fn(),
};

// Mock electron module
jest.mock('electron', () => ({
  ipcRenderer: mockIpcRenderer,
  ipcMain: mockIpcMain,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window methods and properties
global.window = {
  ...global.window,
  matchMedia: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
};

// Setup fake timers
jest.useFakeTimers();

// Add custom matchers
require('jest-extended');

// Setup fake timers globally
jest.useFakeTimers();
