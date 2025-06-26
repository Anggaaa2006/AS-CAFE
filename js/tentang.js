document.addEventListener("DOMContentLoaded", () => {
  // Animate statistics when they come into view
  const statNumbers = document.querySelectorAll(".stat-number")
  const observerOptions = {
    threshold: 0.5,
    rootMargin: "0px 0px -100px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target
        const finalValue = Number.parseFloat(target.dataset.target)
        animateCounter(target, finalValue)
        observer.unobserve(target)
      }
    })
  }, observerOptions)

  statNumbers.forEach((stat) => {
    observer.observe(stat)
  })

  function animateCounter(element, target) {
    let current = 0
    const increment = target / 100
    const duration = 2000 // 2 seconds
    const stepTime = duration / 100

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }

      // Format the number based on the target
      if (target >= 1000) {
        element.textContent = Math.floor(current).toLocaleString()
      } else {
        element.textContent = current.toFixed(1)
      }
    }, stepTime)
  }

  // Smooth scroll for internal links
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

  // Add parallax effect to hero section
  const hero = document.querySelector(".about-hero")
  if (hero) {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset
      const rate = scrolled * -0.5
      hero.style.transform = `translateY(${rate}px)`
    })
  }

  // Animate elements on scroll
  const animateElements = document.querySelectorAll(".value-card, .team-member, .award-item, .mv-card")

  const animateObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1"
          entry.target.style.transform = "translateY(0)"
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  )

  animateElements.forEach((element) => {
    element.style.opacity = "0"
    element.style.transform = "translateY(30px)"
    element.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    animateObserver.observe(element)
  })
})