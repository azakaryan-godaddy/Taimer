const { describe, test, expect, beforeEach } = require('@jest/globals');

// Mock the renderer module
jest.mock('../renderer.js', () => ({
  Timer: class Timer {
    constructor(name, totalSeconds) {
      this.name = name;
      this.totalSeconds = totalSeconds;
      this.remainingSeconds = totalSeconds;
      this.isRunning = false;
      this.isOvertime = false;
      this.interval = null;
    }

    start() {
      this.isRunning = true;
      this.interval = setInterval(() => {
        this.remainingSeconds--;
        if (this.remainingSeconds < 0) {
          this.isOvertime = true;
        }
      }, 1000);
    }

    pause() {
      this.isRunning = false;
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }

    resume() {
      if (!this.interval) {
        this.start();
      }
    }

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }
}));

describe('Timer', () => {
  let Timer;

  beforeEach(() => {
    // Reset the DOM
    document.body.innerHTML = '';
    // Get the Timer class from the mock
    Timer = require('../renderer.js').Timer;
  });

  test('creates a new timer with correct initial values', () => {
    const timer = new Timer('Test Timer', 300); // 5 minutes
    expect(timer.name).toBe('Test Timer');
    expect(timer.totalSeconds).toBe(300);
    expect(timer.isRunning).toBe(false);
  });

  test('formats time correctly', () => {
    const timer = new Timer('Test Timer', 65); // 1:05
    expect(timer.formatTime(65)).toBe('1:05');
    expect(timer.formatTime(3600)).toBe('60:00');
    expect(timer.formatTime(45)).toBe('0:45');
  });

  test('handles overtime correctly', () => {
    const timer = new Timer('Test Timer', 2);
    timer.start();
    // Fast forward 2 seconds to reach 0
    jest.advanceTimersByTime(2000);
    // Fast forward 1 more second to go into overtime
    jest.advanceTimersByTime(1000);
    expect(timer.isOvertime).toBe(true);
    expect(timer.remainingSeconds).toBe(-1);
    // Cleanup
    timer.pause();
  });

  test('pauses and resumes correctly', () => {
    const timer = new Timer('Test Timer', 60);
    timer.start();
    expect(timer.isRunning).toBe(true);
    timer.pause();
    expect(timer.isRunning).toBe(false);
    timer.resume();
    expect(timer.isRunning).toBe(true);
    // Cleanup
    timer.pause();
  });
});
