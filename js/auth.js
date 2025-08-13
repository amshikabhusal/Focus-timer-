// Authentication JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Password strength indicator
  const passwordInput = document.getElementById("password")
  const confirmPasswordInput = document.getElementById("confirm_password")

  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      const strength = calculatePasswordStrength(this.value)
      showPasswordStrength(strength)
    })
  }

  // Password confirmation validation
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", () => {
      validatePasswordMatch()
    })

    passwordInput.addEventListener("input", () => {
      if (confirmPasswordInput.value) {
        validatePasswordMatch()
      }
    })
  }

  // Form validation
  const authForms = document.querySelectorAll(".auth-form")

  authForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      if (!validateForm(this)) {
        e.preventDefault()
      }
    })
  })

  // Real-time email validation
  const emailInput = document.getElementById("email")
  if (emailInput) {
    emailInput.addEventListener("blur", function () {
      validateEmail(this.value)
    })
  }
})

function calculatePasswordStrength(password) {
  let strength = 0

  if (password.length >= 8) strength += 1
  if (password.match(/[a-z]/)) strength += 1
  if (password.match(/[A-Z]/)) strength += 1
  if (password.match(/[0-9]/)) strength += 1
  if (password.match(/[^a-zA-Z0-9]/)) strength += 1

  return strength
}

function showPasswordStrength(strength) {
  // Remove existing strength indicator
  const existingIndicator = document.querySelector(".password-strength")
  if (existingIndicator) {
    existingIndicator.remove()
  }

  const passwordInput = document.getElementById("password")
  const indicator = document.createElement("div")
  indicator.className = "password-strength"

  const strengthLevels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
  const strengthColors = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#10b981"]

  indicator.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill" style="width: ${(strength / 5) * 100}%; background: ${strengthColors[strength - 1] || "#ef4444"}"></div>
        </div>
        <span class="strength-text">${strengthLevels[strength - 1] || "Very Weak"}</span>
    `

  // Add styles
  indicator.style.cssText = `
        margin-top: 8px;
        font-size: 0.875rem;
    `

  const strengthBar = indicator.querySelector(".strength-bar")
  strengthBar.style.cssText = `
        height: 4px;
        background: #e5e7eb;
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 4px;
    `

  const strengthFill = indicator.querySelector(".strength-fill")
  strengthFill.style.cssText = `
        height: 100%;
        transition: all 0.3s ease;
        border-radius: 2px;
    `

  passwordInput.parentNode.appendChild(indicator)
}

function validatePasswordMatch() {
  const password = document.getElementById("password").value
  const confirmPassword = document.getElementById("confirm_password").value
  const confirmInput = document.getElementById("confirm_password")

  // Remove existing validation message
  const existingMessage = confirmInput.parentNode.querySelector(".validation-message")
  if (existingMessage) {
    existingMessage.remove()
  }

  if (confirmPassword && password !== confirmPassword) {
    const message = document.createElement("div")
    message.className = "validation-message error"
    message.textContent = "Passwords do not match"
    message.style.cssText = `
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 4px;
        `

    confirmInput.style.borderColor = "#ef4444"
    confirmInput.parentNode.appendChild(message)
    return false
  } else if (confirmPassword) {
    confirmInput.style.borderColor = "#10b981"
    return true
  }

  return true
}

function validateEmail(email) {
  const emailInput = document.getElementById("email")
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Remove existing validation message
  const existingMessage = emailInput.parentNode.querySelector(".validation-message")
  if (existingMessage) {
    existingMessage.remove()
  }

  if (email && !emailRegex.test(email)) {
    const message = document.createElement("div")
    message.className = "validation-message error"
    message.textContent = "Please enter a valid email address"
    message.style.cssText = `
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 4px;
        `

    emailInput.style.borderColor = "#ef4444"
    emailInput.parentNode.appendChild(message)
    return false
  } else if (email) {
    emailInput.style.borderColor = "#10b981"
    return true
  }

  return true
}

function validateForm(form) {
  let isValid = true

  // Clear previous validation messages
  form.querySelectorAll(".validation-message").forEach((msg) => msg.remove())

  // Reset input styles
  form.querySelectorAll("input").forEach((input) => {
    input.style.borderColor = "#e5e7eb"
  })

  // Validate required fields
  const requiredFields = form.querySelectorAll("input[required]")

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      showFieldError(field, "This field is required")
      isValid = false
    }
  })

  // Validate email
  const emailField = form.querySelector('input[type="email"]')
  if (emailField && emailField.value && !validateEmail(emailField.value)) {
    isValid = false
  }

  // Validate password match
  const confirmPasswordField = form.querySelector("#confirm_password")
  if (confirmPasswordField && !validatePasswordMatch()) {
    isValid = false
  }

  // Validate password strength
  const passwordField = form.querySelector("#password")
  if (passwordField && passwordField.value.length < 6) {
    showFieldError(passwordField, "Password must be at least 6 characters long")
    isValid = false
  }

  return isValid
}

function showFieldError(field, message) {
  const errorDiv = document.createElement("div")
  errorDiv.className = "validation-message error"
  errorDiv.textContent = message
  errorDiv.style.cssText = `
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 4px;
    `

  field.style.borderColor = "#ef4444"
  field.parentNode.appendChild(errorDiv)
}

// Show/hide password functionality
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId)
  const type = input.getAttribute("type") === "password" ? "text" : "password"
  input.setAttribute("type", type)
}
