// Main JavaScript for FocusTimer+
document.addEventListener("DOMContentLoaded", () => {
  // Header scroll effect
  const header = document.getElementById("header")

  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) {
        header.style.background = "rgba(255, 255, 255, 0.98)"
        header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)"
      } else {
        header.style.background = "rgba(255, 255, 255, 0.95)"
        header.style.boxShadow = "none"
      }
    })
  }

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Mobile menu toggle
  const mobileToggle = document.querySelector(".mobile-menu-toggle")
  const navLinks = document.querySelector(".nav-links")

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", function () {
      navLinks.classList.toggle("active")
      this.classList.toggle("active")
    })
  }

  // Parallax effect for floating elements
  const floatingElements = document.querySelectorAll(".floating-element")

  if (floatingElements.length > 0) {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset

      floatingElements.forEach((element, index) => {
        const speed = (index + 1) * 0.3
        element.style.transform = `translateY(${scrolled * speed}px)`
      })
    })
  }

  // Enhanced button hover effects
  const ctaButtons = document.querySelectorAll(".cta-button")

  ctaButtons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      if (this.classList.contains("primary")) {
        this.style.transform = "translateY(-3px) scale(1.02)"
      } else {
        this.style.transform = "translateY(-2px) scale(1.02)"
      }
    })

    button.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)"
    })
  })

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
      }
    })
  }, observerOptions)

  // Observe feature cards
  document.querySelectorAll(".feature-card").forEach((card) => {
    observer.observe(card)
  })

  // Add loading states to forms
  const forms = document.querySelectorAll("form")

  forms.forEach((form) => {
    form.addEventListener("submit", function () {
      const submitButton = this.querySelector('button[type="submit"]')
      if (submitButton) {
        submitButton.disabled = true
        submitButton.innerHTML = "Loading..."

        // Re-enable after 5 seconds as fallback
        setTimeout(() => {
          submitButton.disabled = false
          submitButton.innerHTML = submitButton.dataset.originalText || "Submit"
        }, 5000)
      }
    })
  })

  // Store original button text
  document.querySelectorAll('button[type="submit"]').forEach((button) => {
    button.dataset.originalText = button.innerHTML
  })
})

// Utility functions
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  // Style the notification
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 24px",
    borderRadius: "8px",
    color: "white",
    fontWeight: "500",
    zIndex: "10000",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease",
  })

  // Set background color based on type
  const colors = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  }

  notification.style.backgroundColor = colors[type] || colors.info

  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 5000)
}

// Export for use in other files
window.FocusTimer = {
  showNotification,
}
