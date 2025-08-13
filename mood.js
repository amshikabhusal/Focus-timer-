// Mood tracking functionality
class MoodTracker {
  constructor() {
    this.moods = JSON.parse(localStorage.getItem("moods") || "[]")

    this.moodInput = document.getElementById("moodInput")
    this.moodBtn = document.getElementById("moodBtn")
    this.moodModal = document.getElementById("moodModal")
    this.closeMoodBtn = document.getElementById("closeMood")
    this.moodHistory = document.getElementById("moodHistory")

    this.moodColors = {
      happy: "#d4f9c1",
      sad: "#dee2ff",
      angry: "#f8d7da",
      tired: "#e0d6f5",
      calm: "#c3f5ff",
      excited: "#fff3cd",
      relaxed: "#d4f5e9",
      focused: "#e2f0cb",
      stressed: "#f8d7da",
      motivated: "#d1ecf1",
      anxious: "#f5c6cb",
      content: "#d4edda",
    }

    this.initializeEventListeners()
  }

  initializeEventListeners() {
    this.moodBtn.addEventListener("click", () => this.logMood())

    this.moodInput.addEventListener("input", () => this.updateMoodColor())
    this.moodInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.logMood()
      }
    })

    // Show mood history on long press or double click
    this.moodBtn.addEventListener("dblclick", () => this.showMoodHistory())

    if (this.closeMoodBtn) {
      this.closeMoodBtn.addEventListener("click", () => this.closeMoodModal())
    }

    if (this.moodModal) {
      this.moodModal.addEventListener("click", (e) => {
        if (e.target === this.moodModal) {
          this.closeMoodModal()
        }
      })
    }
  }

  updateMoodColor() {
    const mood = this.moodInput.value.toLowerCase().trim()
    const color = this.moodColors[mood] || "#f8f9fa"

    this.moodInput.style.backgroundColor = color
    this.moodInput.style.color = "#000"

    // Update page background subtly
    document.body.style.background = `linear-gradient(135deg, ${color}22 0%, #f8f9fa 100%)`
  }

  logMood() {
    const moodText = this.moodInput.value.trim()
    if (!moodText) {
      this.showNotification("Please enter your mood first!", "warning")
      return
    }

    const mood = {
      id: Date.now(),
      text: moodText,
      timestamp: new Date().toISOString(),
      color: this.moodColors[moodText.toLowerCase()] || "#f8f9fa",
    }

    this.moods.unshift(mood)
    this.saveMoods()

    this.showNotification(`Mood "${moodText}" logged successfully!`)
    this.moodInput.value = ""
    this.moodInput.style.backgroundColor = ""
    document.body.style.background = ""

    // Send mood data to backend
    this.sendMoodToBackend(mood)
  }

  showMoodHistory() {
    if (!this.moodModal) return

    this.renderMoodHistory()
    this.moodModal.style.display = "block"
  }

  closeMoodModal() {
    if (this.moodModal) {
      this.moodModal.style.display = "none"
    }
  }

  renderMoodHistory() {
    if (!this.moodHistory) return

    if (this.moods.length === 0) {
      this.moodHistory.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No mood entries yet</p>'
      return
    }

    this.moodHistory.innerHTML = this.moods
      .map((mood) => {
        const date = new Date(mood.timestamp)
        const formattedDate =
          date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

        return `
                <div class="mood-entry" style="background-color: ${mood.color};">
                    <div class="mood-entry-date">${formattedDate}</div>
                    <div class="mood-entry-text">${mood.text}</div>
                </div>
            `
      })
      .join("")
  }

  saveMoods() {
    localStorage.setItem("moods", JSON.stringify(this.moods))
  }

  sendMoodToBackend(mood) {
    // Send mood data to PHP backend
    fetch("api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "log_mood",
        mood: mood,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Mood logged to backend successfully")
        }
      })
      .catch((error) => {
        console.error("Error logging mood to backend:", error)
      })
  }

  showNotification(message, type = "success") {
    if (window.pomodoroTimer) {
      window.pomodoroTimer.showNotification(message)
    }
  }

  getMoodStats() {
    const today = new Date().toDateString()
    const todayMoods = this.moods.filter((m) => new Date(m.timestamp).toDateString() === today)

    const moodCounts = {}
    this.moods.forEach((mood) => {
      const moodKey = mood.text.toLowerCase()
      moodCounts[moodKey] = (moodCounts[moodKey] || 0) + 1
    })

    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => (moodCounts[a] > moodCounts[b] ? a : b), "none")

    return {
      totalEntries: this.moods.length,
      todayEntries: todayMoods.length,
      mostCommonMood: mostCommonMood,
      moodCounts: moodCounts,
    }
  }
}

// Initialize mood tracker when page loads
document.addEventListener("DOMContentLoaded", () => {
  window.moodTracker = new MoodTracker()
})
