// Todo functionality
class TodoManager {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem("todos") || "[]")
    this.currentFilter = "all"

    this.todoModal = document.getElementById("todoModal")
    this.todoBtn = document.getElementById("todoBtn")
    this.closeTodoBtn = document.getElementById("closeTodo")
    this.todoInput = document.getElementById("todoInput")
    this.todoPriority = document.getElementById("todoPriority")
    this.addTodoBtn = document.getElementById("addTodoBtn")
    this.todoList = document.getElementById("todoList")

    this.initializeEventListeners()
    this.renderTodos()
  }

  initializeEventListeners() {
    this.todoBtn.addEventListener("click", () => this.openModal())
    this.closeTodoBtn.addEventListener("click", () => this.closeModal())
    this.addTodoBtn.addEventListener("click", () => this.addTodo())

    this.todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTodo()
      }
    })

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"))
        e.target.classList.add("active")
        this.currentFilter = e.target.dataset.filter
        this.renderTodos()
      })
    })

    // Close modal when clicking outside
    this.todoModal.addEventListener("click", (e) => {
      if (e.target === this.todoModal) {
        this.closeModal()
      }
    })
  }

  openModal() {
    this.todoModal.style.display = "block"
    this.todoInput.focus()
  }

  closeModal() {
    this.todoModal.style.display = "none"
  }

  addTodo() {
    const text = this.todoInput.value.trim()
    if (!text) return

    const todo = {
      id: Date.now(),
      text: text,
      priority: this.todoPriority.value,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    this.todos.unshift(todo)
    this.saveTodos()
    this.renderTodos()

    this.todoInput.value = ""
    this.todoPriority.value = "low"

    this.showNotification("Task added successfully!")
  }

  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      this.saveTodos()
      this.renderTodos()
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((t) => t.id !== id)
    this.saveTodos()
    this.renderTodos()
    this.showNotification("Task deleted!")
  }

  renderTodos() {
    let filteredTodos = this.todos

    if (this.currentFilter === "pending") {
      filteredTodos = this.todos.filter((t) => !t.completed)
    } else if (this.currentFilter === "completed") {
      filteredTodos = this.todos.filter((t) => t.completed)
    }

    if (filteredTodos.length === 0) {
      this.todoList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No tasks found</p>'
      return
    }

    this.todoList.innerHTML = filteredTodos
      .map(
        (todo) => `
            <div class="todo-item ${todo.completed ? "completed" : ""}">
                <input type="checkbox" ${todo.completed ? "checked" : ""} 
                       onchange="todoManager.toggleTodo(${todo.id})">
                <span class="todo-text">${todo.text}</span>
                <span class="todo-priority ${todo.priority}">${todo.priority}</span>
                <button class="todo-delete" onclick="todoManager.deleteTodo(${todo.id})">Delete</button>
            </div>
        `,
      )
      .join("")
  }

  saveTodos() {
    localStorage.setItem("todos", JSON.stringify(this.todos))
  }

  showNotification(message) {
    if (window.pomodoroTimer) {
      window.pomodoroTimer.showNotification(message)
    }
  }

  getStats() {
    const total = this.todos.length
    const completed = this.todos.filter((t) => t.completed).length
    const pending = total - completed
    const highPriority = this.todos.filter((t) => t.priority === "high" && !t.completed).length

    return { total, completed, pending, highPriority }
  }
}

// Initialize todo manager when page loads
document.addEventListener("DOMContentLoaded", () => {
  window.todoManager = new TodoManager()
})
