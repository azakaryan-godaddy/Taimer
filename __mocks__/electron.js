// __mocks__/electron.js
const app = {
  quit: jest.fn(),
  on: jest.fn(),
  whenReady: jest.fn().mockImplementation(() => Promise.resolve())
};

const mockWindow = {
  loadFile: jest.fn(),
  webContents: {
    send: jest.fn()
  },
  on: jest.fn(),
  destroy: jest.fn(),
  isDestroyed: jest.fn().mockReturnValue(false),
  close: jest.fn().mockImplementation(() => {
    app.quit();
  })
};

const BrowserWindow = jest.fn().mockReturnValue(mockWindow);

module.exports = {
  app,
  BrowserWindow,
  ipcMain: {
    on: jest.fn(),
    send: jest.fn()
  },
  ipcRenderer: {
    on: jest.fn(),
    send: jest.fn(),
  },
};
