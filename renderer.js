let timerCounter = 0;
const timers = new Map();

class Timer {
    constructor(element) {
        this.id = `timer-${timerCounter++}`;
        this.element = element;
        this.timeDisplay = element.querySelector('.time-display');
        this.nameInput = element.querySelector('.timer-name');
        this.minutesInput = element.querySelector('.minutes');
        this.secondsInput = element.querySelector('.seconds');
        this.startButton = element.querySelector('.start');
        this.pauseButton = element.querySelector('.pause');
        this.resetButton = element.querySelector('.reset');
        this.addMinuteButton = element.querySelector('.add-minute');
        this.removeButton = element.querySelector('.remove-timer');
        this.quickTimers = element.querySelectorAll('.quick-timer');
        this.visualNotify = element.querySelector('.visual-notify');
        
        this.duration = 0;
        this.remainingTime = 0;
        this.isRunning = false;
        this.isOvertime = false;

        this.startButton.textContent = 'Start';
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.start());
        this.pauseButton.addEventListener('click', () => this.stop());
        this.resetButton.addEventListener('click', () => this.reset());
        this.addMinuteButton.addEventListener('click', () => this.addMinute());
        this.removeButton.addEventListener('click', () => this.remove());
        
        this.quickTimers.forEach(button => {
            button.addEventListener('click', () => {
                if (!this.isRunning) {
                    const minutes = parseInt(button.dataset.minutes);
                    this.minutesInput.value = minutes;
                    this.secondsInput.value = 0;
                    this.updateDurationFromInputs();
                }
            });
        });
        
        [this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('change', () => this.updateDurationFromInputs());
        });

        this.visualNotify.addEventListener('change', () => {
            if (!this.visualNotify.checked) {
                this.element.classList.remove('complete');
            }
        });
    }

    updateDurationFromInputs() {
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;
        
        this.duration = (minutes * 60 + seconds) * 1000;
        this.remainingTime = this.duration;
        this.updateDisplay();
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            window.electron.startTimer(this.id, this.remainingTime);
            this.element.classList.add('running');
            this.element.classList.remove('complete');
            this.startButton.textContent = 'Start';
            this.quickTimers.forEach(btn => btn.classList.add('disabled'));
        }
    }

    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            window.electron.stopTimer(this.id);
            this.element.classList.remove('running');
            this.element.classList.remove('complete');
            this.startButton.textContent = 'Resume';
        }
    }

    reset() {
        this.stop();
        this.isOvertime = false;
        this.remainingTime = this.duration;
        this.updateDisplay();
        this.element.classList.remove('overtime');
        this.element.classList.remove('complete');
        this.quickTimers.forEach(btn => btn.classList.remove('disabled'));
        window.electron.resetTimer(this.id);
    }

    remove() {
        this.stop();
        this.element.remove();
        timers.delete(this.id);
        window.electron.resetTimer(this.id);
    }

    addMinute() {
        const minuteInMs = 60000;
        this.remainingTime += minuteInMs;
        if (this.remainingTime > 0 && this.isOvertime) {
            this.isOvertime = false;
            this.element.classList.remove('overtime');
        }
        this.updateDisplay();
        if (this.isRunning) {
            window.electron.addMinute(this.id);
        }
    }

    updateDisplay() {
        const absTime = Math.abs(this.remainingTime);
        const minutes = Math.floor(absTime / 60000);
        const seconds = Math.floor((absTime % 60000) / 1000);
        
        if (this.isOvertime) {
            this.timeDisplay.innerHTML = `In overtime:<br>${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const addTimerButton = document.getElementById('addTimer');
    const timersContainer = document.getElementById('timers');
    const timerTemplate = document.getElementById('timer-template');

    addTimerButton.addEventListener('click', () => {
        const timerElement = document.importNode(timerTemplate.content, true).querySelector('.timer');
        timersContainer.appendChild(timerElement);
        const timer = new Timer(timerElement);
        timers.set(timer.id, timer);
    });

    // Add one timer by default
    addTimerButton.click();        // Handle timer updates from main process
    window.electron.onTimerUpdate((event, timerId, remainingTime) => {
        const timer = timers.get(timerId);
        if (timer) {
            timer.remainingTime = remainingTime;
            if (remainingTime < 0 && !timer.isOvertime) {
                timer.isOvertime = true;
                timer.element.classList.add('overtime');
                if (timer.visualNotify.checked) {
                    timer.element.classList.add('complete');
                }
            } else if (remainingTime >= 0 && timer.isOvertime) {
                timer.isOvertime = false;
                timer.element.classList.remove('overtime');
                timer.element.classList.remove('complete');
            }
            timer.updateDisplay();
        }
    });

    window.electron.onTimerComplete((event, timerId) => {
        const timer = timers.get(timerId);
        if (timer && timer.visualNotify.checked) {
            timer.element.classList.add('complete');
        }
    });
});