// Timer functionality
class PomodoroTimer {
  constructor() {
    this.timer = null
    this.isRunning = false
    this.timeRemaining = 25 * 60 // 25 minutes in seconds
    this.currentSession = "pomodoro"
    this.sessionCount = 0

    this.timerDisplay = document.getElementById("timer")
    this.startStopBtn = document.getElementById("startStopBtn")
    this.resetBtn = document.getElementById("resetBtn")
    this.timerStatus = document.getElementById("timerStatus")
    this.progressCircle = document.querySelector(".progress-ring-circle")

    this.pomodoroInput = document.getElementById("pomodoroLength")
    this.shortBreakInput = document.getElementById("shortBreak")
    this.longBreakInput = document.getElementById("longBreak")

    this.initializeEventListeners()
    this.updateDisplay()
    this.updateProgress()
  }

  initializeEventListeners() {
    this.startStopBtn.addEventListener("click", () => this.toggleTimer())
    this.resetBtn.addEventListener("click", () => this.resetTimer())

    // Update timer when inputs change
    ;[this.pomodoroInput, this.shortBreakInput, this.longBreakInput].forEach((input) => {
      input.addEventListener("change", () => {
        if (!this.isRunning) {
          this.resetTimer()
        }
      })
    })
  }

  toggleTimer() {
    if (!this.isRunning) {
      this.startTimer()
    } else {
      this.pauseTimer()
    }
  }

  startTimer() {
    this.isRunning = true
    this.startStopBtn.textContent = "Pause"
    this.startStopBtn.classList.remove("primary")
    this.startStopBtn.classList.add("secondary")

    this.timer = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--
        this.updateDisplay()
        this.updateProgress()
      } else {
        this.completeSession()
      }
    }, 1000)

    this.updateStatus()
  }

  pauseTimer() {
    this.isRunning = false
    this.startStopBtn.textContent = "Start"
    this.startStopBtn.classList.remove("secondary")
    this.startStopBtn.classList.add("primary")
    clearInterval(this.timer)
    this.updateStatus()
  }

  resetTimer() {
    this.pauseTimer()

    if (this.currentSession === "pomodoro") {
      this.timeRemaining = this.pomodoroInput.value * 60
    } else if (this.currentSession === "shortBreak") {
      this.timeRemaining = this.shortBreakInput.value * 60
    } else {
      this.timeRemaining = this.longBreakInput.value * 60
    }

    this.updateDisplay()
    this.updateProgress()
    this.updateStatus()
  }

  completeSession() {
    this.pauseTimer()
    this.playNotificationSound()

    if (this.currentSession === "pomodoro") {
      this.sessionCount++
      this.saveSession()

      // Determine next session type
      if (this.sessionCount % 4 === 0) {
        this.currentSession = "longBreak"
        this.timeRemaining = this.longBreakInput.value * 60
        this.showNotification("Great work! Time for a long break.")
      } else {
        this.currentSession = "shortBreak"
        this.timeRemaining = this.shortBreakInput.value * 60
        this.showNotification("Focus session complete! Take a short break.")
      }
    } else {
      this.currentSession = "pomodoro"
      this.timeRemaining = this.pomodoroInput.value * 60
      this.showNotification("Break time over! Ready to focus?")
    }

    this.updateDisplay()
    this.updateProgress()
    this.updateStatus()

    // Suggest mood logging after pomodoro sessions
    if (this.currentSession === "shortBreak" || this.currentSession === "longBreak") {
      setTimeout(() => {
        if (confirm("Would you like to log your current mood?")) {
          document.getElementById("moodInput").focus()
        }
      }, 2000)
    }
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeRemaining / 60)
    const seconds = this.timeRemaining % 60
    this.timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  updateProgress() {
    let totalTime
    if (this.currentSession === "pomodoro") {
      totalTime = this.pomodoroInput.value * 60
    } else if (this.currentSession === "shortBreak") {
      totalTime = this.shortBreakInput.value * 60
    } else {
      totalTime = this.longBreakInput.value * 60
    }

    const progress = (totalTime - this.timeRemaining) / totalTime
    const circumference = 2 * Math.PI * 140 // radius = 140
    const offset = circumference - progress * circumference

    if (this.progressCircle) {
      this.progressCircle.style.strokeDashoffset = offset

      // Change color based on session type
      if (this.currentSession === "pomodoro") {
        this.progressCircle.style.stroke = "#007bff"
      } else {
        this.progressCircle.style.stroke = "#28a745"
      }
    }
  }

  updateStatus() {
    let status = ""
    if (this.currentSession === "pomodoro") {
      status = this.isRunning ? "Focus time - stay concentrated!" : "Ready to focus"
    } else if (this.currentSession === "shortBreak") {
      status = this.isRunning ? "Short break - relax and recharge" : "Break time"
    } else {
      status = this.isRunning ? "Long break - take your time" : "Long break time"
    }

    if (this.timerStatus) {
      this.timerStatus.textContent = status
    }

    // Update body background based on session
    document.body.className = `focus-page ${this.currentSession}`
  }

  saveSession() {
    const sessions = JSON.parse(localStorage.getItem("pomodoroSessions") || "[]")
    sessions.push({
      date: new Date().toISOString(),
      duration: this.pomodoroInput.value,
      type: "pomodoro",
    })
    localStorage.setItem("pomodoroSessions", JSON.stringify(sessions))

    // Update daily stats
    this.updateDailyStats()
  }

  updateDailyStats() {
    const today = new Date().toDateString()
    const stats = JSON.parse(localStorage.getItem("dailyStats") || "{}")

    if (!stats[today]) {
      stats[today] = { sessions: 0, totalTime: 0 }
    }

    stats[today].sessions++
    stats[today].totalTime += Number.parseInt(this.pomodoroInput.value)

    localStorage.setItem("dailyStats", JSON.stringify(stats))
  }

  playNotificationSound() {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById("notification")
    if (!notification) {
      notification = document.createElement("div")
      notification.id = "notification"
      notification.className = "notification"
      document.body.appendChild(notification)
    }

    notification.textContent = message
    notification.classList.add("show")

    setTimeout(() => {
      notification.classList.remove("show")
    }, 4000)
  }
}

// Initialize timer when page loads
document.addEventListener("DOMContentLoaded", () => {
  window.pomodoroTimer = new PomodoroTimer()
})
