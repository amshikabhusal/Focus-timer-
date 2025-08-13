// Global App State
class FocusTimerApp {
  constructor() {
    this.timer = new FocusTimer()
    this.moodTracker = new MoodTracker()
    this.todoManager = new TodoManager()
    this.insights = new ProductivityInsights()
    this.achievements = new AchievementSystem()
    this.initializeApp()
  }

  initializeApp() {
    this.initializeTabs()
    this.timer.initialize()
    this.moodTracker.initialize()
    this.todoManager.initialize()
    this.insights.initialize()
    this.achievements.initialize()
    this.connectSystems()
  }

  connectSystems() {
    // Connect timer completion to mood and task suggestions
    this.timer.onSessionComplete = () => this.handleSessionComplete()
    this.timer.onBreakStart = () => this.handleBreakStart()

    // Connect task completion to achievements
    this.todoManager.onTaskComplete = (task) => this.achievements.checkTaskAchievements(task)

    // Update insights when data changes
    this.timer.onStatsUpdate = () => this.insights.updateInsights()
    this.todoManager.onStatsUpdate = () => this.insights.updateInsights()
  }

  handleSessionComplete() {
    // Show mood tracking suggestion after focus session
    this.showMoodSuggestion()
    // Update task completion suggestions
    this.updateTaskSuggestions()
    // Check for achievements
    this.achievements.checkSessionAchievements(this.timer.totalSessions)
    // Update insights
    this.insights.updateInsights()
  }

  handleBreakStart() {
    // Show pending tasks during break
    this.showBreakTasks()
  }

  showMoodSuggestion() {
    const moodTab = document.querySelector('[data-tab="mood"]')
    moodTab.classList.add("has-notification")

    setTimeout(() => {
      moodTab.classList.remove("has-notification")
    }, 10000)
  }

  updateTaskSuggestions() {
    const pendingTasks = this.todoManager.todos.filter((t) => !t.completed).length
    if (pendingTasks > 0) {
      const todoTab = document.querySelector('[data-tab="todo"]')
      todoTab.classList.add("has-notification")

      setTimeout(() => {
        todoTab.classList.remove("has-notification")
      }, 8000)
    }
  }

  showBreakTasks() {
    const pendingTasks = this.todoManager.todos.filter((t) => !t.completed && t.priority === "high").slice(0, 3)
    if (pendingTasks.length > 0) {
      this.displayBreakTaskSuggestions(pendingTasks)
    }
  }

  displayBreakTaskSuggestions(tasks) {
    const breakContent = document.getElementById("breakContent")
    const existingTasks = breakContent.querySelector(".break-tasks")
    if (existingTasks) {
      existingTasks.remove()
    }

    const taskSuggestions = document.createElement("div")
    taskSuggestions.className = "break-tasks"
    taskSuggestions.innerHTML = `
      <h4>Quick Tasks for Your Break:</h4>
      <ul>
        ${tasks.map((task) => `<li onclick="app.completeTaskFromBreak(${task.id})">${task.text}</li>`).join("")}
      </ul>
    `
    breakContent.appendChild(taskSuggestions)
  }

  completeTaskFromBreak(taskId) {
    this.todoManager.toggleTodo(taskId)
    // Remove the task from break suggestions
    const taskElement = event.target
    taskElement.style.textDecoration = "line-through"
    taskElement.style.opacity = "0.5"

    // Show achievement notification
    this.achievements.showNotification("Task completed during break! 🎉")
  }

  getProductivityInsights() {
    const sessions = this.timer.totalSessions
    const completedTasks = this.todoManager.todos.filter((t) => t.completed).length
    const recentMoods = JSON.parse(localStorage.getItem("recentMoods") || "[]")

    return {
      sessions,
      completedTasks,
      productivity: sessions > 0 ? (completedTasks / sessions).toFixed(1) : 0,
      moodTrend: this.calculateMoodTrend(recentMoods),
    }
  }

  calculateMoodTrend(moods) {
    if (moods.length < 2) return "neutral"
    const recent = moods.slice(-3).map((m) => m.intensity)
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length
    return avg > 6 ? "positive" : avg < 4 ? "negative" : "neutral"
  }

  initializeTabs() {
    const tabs = document.querySelectorAll(".nav-tab")
    const contents = document.querySelectorAll(".tab-content")

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetTab = tab.dataset.tab

        // Remove active class from all tabs and contents
        tabs.forEach((t) => t.classList.remove("active"))
        contents.forEach((c) => c.classList.remove("active"))

        // Add active class to clicked tab and corresponding content
        tab.classList.add("active")
        document.getElementById(`${targetTab}-tab`).classList.add("active")
      })
    })
  }
}

// Timer Class
class FocusTimer {
  constructor() {
    this.focusTime = 25 * 60 // 25 minutes in seconds
    this.breakTime = 5 * 60 // 5 minutes in seconds
    this.currentTime = this.focusTime
    this.isRunning = false
    this.isBreak = false
    this.interval = null
    this.totalSessions = 0
    this.todayMinutes = Number.parseInt(localStorage.getItem("todayMinutes") || "0")
    this.streak = Number.parseInt(localStorage.getItem("streak") || "0")
    this.onSessionComplete = null
    this.onBreakStart = null
    this.onStatsUpdate = null
  }

  initialize() {
    this.initializeProgress()
    this.loadSessionStats()
    this.updateStats()
    this.loadQuotes()
    this.updateDisplay()
    this.checkNewDay()
  }

  async loadSessionStats() {
    try {
      const response = await fetch("api.php?action=get_sessions")
      const data = await response.json()
      this.totalSessions = data.total_sessions || 0
    } catch (error) {
      console.error("Error loading session stats:", error)
    }
  }

  initializeProgress() {
    const circle = document.getElementById("progressCircle")
    const radius = 90
    const circumference = 2 * Math.PI * radius

    circle.style.strokeDasharray = circumference
    circle.style.strokeDashoffset = circumference
  }

  updateProgress() {
    const circle = document.getElementById("progressCircle")
    const radius = 90
    const circumference = 2 * Math.PI * radius
    const totalTime = this.isBreak ? this.breakTime : this.focusTime
    const progress = (totalTime - this.currentTime) / totalTime
    const offset = circumference - progress * circumference

    circle.style.strokeDashoffset = offset
    circle.style.stroke = this.isBreak ? "#28a745" : "#667eea"
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  updateDisplay() {
    document.getElementById("timerDisplay").textContent = this.formatTime(this.currentTime)
    this.updateProgress()
  }

  toggleTimer() {
    const startBtn = document.getElementById("startBtn")
    const timerDisplay = document.getElementById("timerDisplay")

    if (this.isRunning) {
      this.pause()
      startBtn.textContent = "Start"
      timerDisplay.classList.remove("pulse")
    } else {
      this.start()
      startBtn.textContent = "Pause"
      timerDisplay.classList.add("pulse")
    }
  }

  start() {
    this.isRunning = true
    this.interval = setInterval(() => {
      this.currentTime--
      this.updateDisplay()

      if (this.currentTime <= 0) {
        this.complete()
      }
    }, 1000)
  }

  pause() {
    this.isRunning = false
    clearInterval(this.interval)
  }

  reset() {
    this.pause()
    this.currentTime = this.isBreak ? this.breakTime : this.focusTime
    this.updateDisplay()
    document.getElementById("startBtn").textContent = "Start"
    document.getElementById("timerDisplay").classList.remove("pulse")

    if (this.isBreak) {
      this.switchToFocus()
    }
  }

  complete() {
    this.pause()
    document.getElementById("startBtn").textContent = "Start"
    document.getElementById("timerDisplay").classList.remove("pulse")

    if (this.isBreak) {
      this.switchToFocus()
    } else {
      this.switchToBreak()
      this.logSession()
      if (this.onSessionComplete) {
        this.onSessionComplete()
      }
    }

    this.playNotificationSound()
  }

  switchToBreak() {
    this.isBreak = true
    this.currentTime = this.breakTime
    document.getElementById("timerLabel").textContent = "Break Time"
    document.getElementById("breakContent").classList.add("active")
    this.showRandomQuote()
    this.updateDisplay()
    if (this.onBreakStart) {
      this.onBreakStart()
    }
  }

  switchToFocus() {
    this.isBreak = false
    this.currentTime = this.focusTime
    document.getElementById("timerLabel").textContent = "Focus Session"
    document.getElementById("breakContent").classList.remove("active")
    const breakTasks = document.querySelector(".break-tasks")
    if (breakTasks) {
      breakTasks.remove()
    }
    this.updateDisplay()
  }

  async logSession() {
    try {
      const response = await fetch("api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "action=log_session",
      })

      const data = await response.json()
      if (data.success) {
        this.totalSessions = data.total_sessions
        this.todayMinutes += 25
        this.streak++

        localStorage.setItem("todayMinutes", this.todayMinutes.toString())
        localStorage.setItem("streak", this.streak.toString())
        localStorage.setItem("totalSessions", this.totalSessions.toString())

        this.updateStats()
        if (this.onStatsUpdate) {
          this.onStatsUpdate()
        }
      }
    } catch (error) {
      console.error("Error logging session:", error)
    }
  }

  updateStats() {
    document.getElementById("sessionsCount").textContent = this.totalSessions
    document.getElementById("todayTime").textContent = Math.floor(this.todayMinutes / 60) + "h"
    document.getElementById("streakCount").textContent = this.streak
  }

  loadQuotes() {
    this.quotes = [
      { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
      { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
      { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
      { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
      { text: "Education is the most powerful weapon you can use to change the world.", author: "Nelson Mandela" },
      { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
      { text: "Study while others are sleeping; work while others are loafing.", author: "William A. Ward" },
      { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
      { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
      { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
    ]
  }

  showRandomQuote() {
    const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)]
    document.getElementById("quoteText").textContent = `"${randomQuote.text}"`
    document.getElementById("quoteAuthor").textContent = `— ${randomQuote.author}`
  }

  playNotificationSound() {
    try {
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
    } catch (error) {
      console.log("Audio notification not supported")
    }
  }

  checkNewDay() {
    const lastDate = localStorage.getItem("lastDate")
    const today = new Date().toDateString()

    if (lastDate !== today) {
      localStorage.setItem("todayMinutes", "0")
      localStorage.setItem("lastDate", today)
      this.todayMinutes = 0
      this.updateStats()
    }
  }
}

// Mood Tracker Class
class MoodTracker {
  constructor() {
    this.selectedMood = null
    this.intensity = 5
  }

  initialize() {
    this.setupMoodButtons()
    this.setupIntensitySlider()
    this.loadMoodHistory()
  }

  setupMoodButtons() {
    const moodButtons = document.querySelectorAll(".mood-btn")
    moodButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove selected class from all buttons
        moodButtons.forEach((b) => b.classList.remove("selected"))

        // Add selected class to clicked button
        btn.classList.add("selected")
        this.selectedMood = btn.dataset.mood

        // Enable log mood button
        document.getElementById("logMoodBtn").disabled = false
      })
    })
  }

  setupIntensitySlider() {
    const slider = document.getElementById("moodIntensity")
    const valueDisplay = document.getElementById("intensityValue")

    slider.addEventListener("input", (e) => {
      this.intensity = Number.parseInt(e.target.value)
      valueDisplay.textContent = this.intensity
    })
  }

  async logMood() {
    if (!this.selectedMood) return

    try {
      const response = await fetch("api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `action=log_mood&mood=${this.selectedMood}&intensity=${this.intensity}`,
      })

      const data = await response.json()
      if (data.success) {
        // Reset selection
        document.querySelectorAll(".mood-btn").forEach((btn) => btn.classList.remove("selected"))
        document.getElementById("logMoodBtn").disabled = true
        this.selectedMood = null

        this.storeRecentMood()

        // Reload mood history
        this.loadMoodHistory()
      }
    } catch (error) {
      console.error("Error logging mood:", error)
    }
  }

  storeRecentMood() {
    const recentMoods = JSON.parse(localStorage.getItem("recentMoods") || "[]")
    recentMoods.push({
      mood: this.selectedMood,
      intensity: this.intensity,
      timestamp: Date.now(),
    })

    // Keep only last 10 moods
    if (recentMoods.length > 10) {
      recentMoods.shift()
    }

    localStorage.setItem("recentMoods", JSON.stringify(recentMoods))
  }

  async loadMoodHistory() {
    try {
      const response = await fetch("api.php?action=get_moods")
      const data = await response.json()
      this.displayMoodHistory(data.moods || [])
    } catch (error) {
      console.error("Error loading mood history:", error)
    }
  }

  displayMoodHistory(moods) {
    const moodList = document.getElementById("moodList")

    if (moods.length === 0) {
      moodList.innerHTML = '<p style="text-align: center; color: #666;">No moods logged yet.</p>'
      return
    }

    const recentMoods = moods.slice(-5).reverse() // Show last 5 moods
    moodList.innerHTML = recentMoods
      .map(
        (mood) => `
            <div class="mood-item">
                <div class="mood-item-info">
                    <strong>${this.getMoodEmoji(mood.mood)} ${this.capitalizeFirst(mood.mood)}</strong>
                    <span>(${mood.intensity}/10)</span>
                </div>
                <div class="mood-item-time">${this.formatDate(mood.date)}</div>
            </div>
        `,
      )
      .join("")
  }

  getMoodEmoji(mood) {
    const emojiMap = {
      happy: "😊",
      excited: "🤩",
      calm: "😌",
      focused: "🎯",
      tired: "😴",
      stressed: "😰",
      sad: "😢",
      anxious: "😟",
      motivated: "💪",
      confused: "🤔",
    }
    return emojiMap[mood] || "😐"
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleString()
  }
}

// Todo Manager Class
class TodoManager {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem("todos") || "[]")
    this.currentFilter = "all"
    this.onTaskComplete = null
    this.onStatsUpdate = null
  }

  initialize() {
    this.setupEventListeners()
    this.renderTodos()
    this.updateStats()
  }

  setupEventListeners() {
    // Add todo on Enter key
    document.getElementById("todoInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTodo()
      }
    })

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")
        this.currentFilter = btn.dataset.filter
        this.renderTodos()
      })
    })
  }

  addTodo() {
    const input = document.getElementById("todoInput")
    const priority = document.getElementById("todoPriority").value
    const text = input.value.trim()

    if (!text) return

    const todo = {
      id: Date.now(),
      text: text,
      priority: priority,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    this.todos.push(todo)
    this.saveTodos()
    this.renderTodos()
    this.updateStats()
    if (this.onStatsUpdate) {
      this.onStatsUpdate()
    }

    // Clear input
    input.value = ""
  }

  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      if (todo.completed) {
        todo.completedAt = new Date().toISOString()
        if (this.onTaskComplete) {
          this.onTaskComplete(todo)
        }
      } else {
        delete todo.completedAt
      }
      this.saveTodos()
      this.renderTodos()
      this.updateStats()
      if (this.onStatsUpdate) {
        this.onStatsUpdate()
      }
      if (todo.completed) {
        this.showTaskCompletionFeedback(todo.text)
      }
    }
  }

  showTaskCompletionFeedback(taskText) {
    const feedback = document.createElement("div")
    feedback.className = "task-completion-toast"
    feedback.innerHTML = `✓ Completed: ${taskText}`
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `

    document.body.appendChild(feedback)

    setTimeout(() => {
      feedback.remove()
    }, 3000)
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((t) => t.id !== id)
    this.saveTodos()
    this.renderTodos()
    this.updateStats()
    if (this.onStatsUpdate) {
      this.onStatsUpdate()
    }
  }

  getFilteredTodos() {
    switch (this.currentFilter) {
      case "completed":
        return this.todos.filter((t) => t.completed)
      case "pending":
        return this.todos.filter((t) => !t.completed)
      case "high":
        return this.todos.filter((t) => t.priority === "high")
      default:
        return this.todos
    }
  }

  renderTodos() {
    const todoList = document.getElementById("todoList")
    const filteredTodos = this.getFilteredTodos()

    if (filteredTodos.length === 0) {
      todoList.innerHTML = '<p style="text-align: center; color: #666;">No tasks found.</p>'
      return
    }

    todoList.innerHTML = filteredTodos
      .map(
        (todo) => `
            <div class="todo-item ${todo.completed ? "completed" : ""} ${todo.priority}-priority">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? "checked" : ""} 
                       onchange="app.todoManager.toggleTodo(${todo.id})">
                <span class="todo-text">${todo.text}</span>
                <span class="todo-priority ${todo.priority}">${todo.priority}</span>
                <button class="todo-delete" onclick="app.todoManager.deleteTodo(${todo.id})">×</button>
            </div>
        `,
      )
      .join("")
  }

  updateStats() {
    const total = this.todos.length
    const completed = this.todos.filter((t) => t.completed).length
    const pending = total - completed

    document.getElementById("totalTasks").textContent = total
    document.getElementById("completedTasks").textContent = completed
    document.getElementById("pendingTasks").textContent = pending
  }

  saveTodos() {
    localStorage.setItem("todos", JSON.stringify(this.todos))
  }

  getHighPriorityPendingTasks() {
    return this.todos.filter((t) => !t.completed && t.priority === "high")
  }
}

// Added new ProductivityInsights class
class ProductivityInsights {
  constructor() {
    this.weeklyGoals = {
      sessions: 35,
      tasks: 20,
      hours: 15,
    }
  }

  initialize() {
    this.updateInsights()
  }

  updateInsights() {
    this.updateFocusScore()
    this.updateTaskCompletion()
    this.updateMoodTrend()
    this.updateProductivityRatio()
    this.updateWeeklyProgress()
  }

  updateFocusScore() {
    const todayMinutes = Number.parseInt(localStorage.getItem("todayMinutes") || "0")
    const sessions = Math.floor(todayMinutes / 25)
    document.getElementById("focusScore").textContent = sessions
  }

  updateTaskCompletion() {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]")
    const total = todos.length
    const completed = todos.filter((t) => t.completed).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    document.getElementById("taskCompletion").textContent = `${percentage}%`
  }

  updateMoodTrend() {
    const recentMoods = JSON.parse(localStorage.getItem("recentMoods") || "[]")
    const trend = this.calculateMoodTrend(recentMoods)
    document.getElementById("moodTrend").textContent = this.formatMoodTrend(trend)
  }

  updateProductivityRatio() {
    const sessions = Number.parseInt(localStorage.getItem("totalSessions") || "0")
    const todos = JSON.parse(localStorage.getItem("todos") || "[]")
    const completed = todos.filter((t) => t.completed).length
    const ratio = sessions > 0 ? (completed / sessions).toFixed(1) : "0.0"
    document.getElementById("productivityRatio").textContent = ratio
  }

  updateWeeklyProgress() {
    const todayMinutes = Number.parseInt(localStorage.getItem("todayMinutes") || "0")
    const weeklyMinutes = Number.parseInt(localStorage.getItem("weeklyMinutes") || "0") + todayMinutes
    const weeklySessions = Math.floor(weeklyMinutes / 25)
    const weeklyHours = Math.floor(weeklyMinutes / 60)

    const todos = JSON.parse(localStorage.getItem("todos") || "[]")
    const weeklyTasks = todos.filter((t) => t.completed && this.isThisWeek(t.completedAt)).length

    // Update progress bars
    this.updateProgressBar("weeklySessionsProgress", weeklySessions, this.weeklyGoals.sessions)
    this.updateProgressBar("weeklyTasksProgress", weeklyTasks, this.weeklyGoals.tasks)
    this.updateProgressBar("weeklyHoursProgress", weeklyHours, this.weeklyGoals.hours)

    // Update text
    document.getElementById("weeklySessionsText").textContent = `${weeklySessions}/${this.weeklyGoals.sessions}`
    document.getElementById("weeklyTasksText").textContent = `${weeklyTasks}/${this.weeklyGoals.tasks}`
    document.getElementById("weeklyHoursText").textContent = `${weeklyHours}/${this.weeklyGoals.hours}h`
  }

  updateProgressBar(elementId, current, goal) {
    const percentage = Math.min((current / goal) * 100, 100)
    document.getElementById(elementId).style.width = `${percentage}%`
  }

  calculateMoodTrend(moods) {
    if (moods.length < 2) return "neutral"
    const recent = moods.slice(-3).map((m) => m.intensity)
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length
    return avg > 6 ? "positive" : avg < 4 ? "negative" : "neutral"
  }

  formatMoodTrend(trend) {
    const trendMap = {
      positive: "📈 Positive",
      negative: "📉 Needs Care",
      neutral: "➡️ Stable",
    }
    return trendMap[trend] || "Neutral"
  }

  isThisWeek(dateString) {
    if (!dateString) return false
    const date = new Date(dateString)
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    return date >= weekStart
  }
}

// Added new AchievementSystem class
class AchievementSystem {
  constructor() {
    this.achievements = JSON.parse(localStorage.getItem("achievements") || "[]")
  }

  initialize() {
    this.displayAchievements()
  }

  checkSessionAchievements(totalSessions) {
    const milestones = [1, 5, 10, 25, 50, 100]
    milestones.forEach((milestone) => {
      if (totalSessions === milestone && !this.hasAchievement(`sessions_${milestone}`)) {
        this.unlockAchievement(`sessions_${milestone}`, `🎯 Completed ${milestone} focus sessions!`)
      }
    })

    // Check streak achievements
    const streak = Number.parseInt(localStorage.getItem("streak") || "0")
    const streakMilestones = [3, 7, 14, 30]
    streakMilestones.forEach((milestone) => {
      if (streak === milestone && !this.hasAchievement(`streak_${milestone}`)) {
        this.unlockAchievement(`streak_${milestone}`, `🔥 ${milestone} day focus streak!`)
      }
    })
  }

  checkTaskAchievements(task) {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]")
    const completed = todos.filter((t) => t.completed).length

    const taskMilestones = [1, 10, 25, 50, 100]
    taskMilestones.forEach((milestone) => {
      if (completed === milestone && !this.hasAchievement(`tasks_${milestone}`)) {
        this.unlockAchievement(`tasks_${milestone}`, `✅ Completed ${milestone} tasks!`)
      }
    })

    // High priority task achievement
    if (task.priority === "high" && !this.hasAchievement("high_priority_master")) {
      const highPriorityCompleted = todos.filter((t) => t.completed && t.priority === "high").length
      if (highPriorityCompleted >= 10) {
        this.unlockAchievement("high_priority_master", "⭐ High Priority Master!")
      }
    }
  }

  hasAchievement(id) {
    return this.achievements.some((a) => a.id === id)
  }

  unlockAchievement(id, message) {
    const achievement = {
      id,
      message,
      timestamp: new Date().toISOString(),
    }

    this.achievements.push(achievement)
    localStorage.setItem("achievements", JSON.stringify(this.achievements))

    this.showNotification(message)
    this.displayAchievements()
  }

  showNotification(message) {
    const notification = document.createElement("div")
    notification.className = "achievement-notification"
    notification.innerHTML = `🏆 ${message}`
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      z-index: 1000;
      animation: slideIn 0.5s ease, fadeOut 0.5s ease 4s;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      max-width: 300px;
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 5000)
  }

  displayAchievements() {
    const achievementList = document.getElementById("achievementList")

    if (this.achievements.length === 0) {
      achievementList.innerHTML = `
        <div class="achievement-item">
          <span class="achievement-icon">🏆</span>
          <span>Welcome to FocusTimer+!</span>
        </div>
      `
      return
    }

    const recentAchievements = this.achievements.slice(-5).reverse()
    achievementList.innerHTML = recentAchievements
      .map(
        (achievement) => `
        <div class="achievement-item">
          <span class="achievement-icon">🏆</span>
          <span>${achievement.message}</span>
        </div>
      `,
      )
      .join("")
  }
}

// Global instances
let app, timer, moodTracker, todoManager, insights, achievements

// Global functions for HTML onclick handlers
function toggleTimer() {
  timer.toggleTimer()
}

function resetTimer() {
  timer.reset()
}

function logMood() {
  moodTracker.logMood()
}

function addTodo() {
  todoManager.addTodo()
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Create instances
  timer = new FocusTimer()
  moodTracker = new MoodTracker()
  todoManager = new TodoManager()
  insights = new ProductivityInsights()
  achievements = new AchievementSystem()
  app = new FocusTimerApp()

  // Initialize all components
  app.initializeApp()

  console.log("FocusTimer+ initialized successfully!")
})
