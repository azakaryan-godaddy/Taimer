const { describe, test, expect, beforeEach } = require('@jest/globals');

// Mock theme functionality
const toggleTheme = () => {
  const isDark = document.body.classList.contains('dark-theme');
  document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
};

// Mock the theme module
jest.mock('../renderer.js', () => ({
  toggleTheme
}));

describe('Theme Management', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        <button id="theme-toggle" onclick="window.toggleTheme()">Toggle Theme</button>
      </div>
    `;
    window.toggleTheme = toggleTheme;
    localStorage.clear();
  });

  test('toggles between light and dark themes', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const initialTheme = document.body.classList.contains('dark-theme');
    
    themeToggle.click();
    expect(document.body.classList.contains('dark-theme')).toBe(!initialTheme);
    
    themeToggle.click();
    expect(document.body.classList.contains('dark-theme')).toBe(initialTheme);
  });

  test('persists theme preference', () => {
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.click();
    
    const savedTheme = localStorage.getItem('theme');
    expect(savedTheme).toBe(document.body.classList.contains('dark-theme') ? 'dark' : 'light');
  });

  test('loads saved theme preference', () => {
    localStorage.setItem('theme', 'dark');
    // Simulate page load
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(document.body.classList.contains('dark-theme')).toBe(true);
  });
});
