// Landing page functionality
document.addEventListener("DOMContentLoaded", () => {
  // Header scroll effect
  window.addEventListener("scroll", () => {
    const header = document.getElementById("header")
    if (window.scrollY > 100) {
      header.style.background = "rgba(255, 255, 255, 0.98)"
      header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)"
    } else {
      header.style.background = "rgba(255, 255, 255, 0.95)"
      header.style.boxShadow = "none"
    }
  })

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

  // Add parallax effect to floating elements
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset
    const parallaxElements = document.querySelectorAll(".floating-element")

    parallaxElements.forEach((element, index) => {
      const speed = (index + 1) * 0.5
      element.style.transform = `translateY(${scrolled * speed}px)`
    })
  })

  // Add hover effect to CTA button
  const ctaButton = document.querySelector(".cta-button")
  if (ctaButton) {
    ctaButton.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-3px) scale(1.05)"
    })

    ctaButton.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)"
    })
  }

  // Show welcome notification
  showNotification("Welcome to Bee Focus Timer!")
})

// Notification system
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification")
  if (notification) {
    notification.textContent = message
    notification.className = `notification ${type}`
    notification.classList.add("show")

    setTimeout(() => {
      notification.classList.remove("show")
    }, 3000)
  }
}
