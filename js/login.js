document.addEventListener("DOMContentLoaded", () => {
  // Tab switching functionality
  const tabBtns = document.querySelectorAll(".tab-btn")
  const authForms = document.querySelectorAll(".auth-form")

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab")

      // Remove active class from all tabs and forms
      tabBtns.forEach((tab) => tab.classList.remove("active"))
      authForms.forEach((form) => form.classList.remove("active"))

      // Add active class to clicked tab and corresponding form
      this.classList.add("active")
      document.getElementById(targetTab + "-form").classList.add("active")
    })
  })

  // Password toggle functionality
  const togglePasswordBtns = document.querySelectorAll(".toggle-password")

  togglePasswordBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const input = this.parentElement.querySelector("input")
      const icon = this.querySelector("i")

      if (input.type === "password") {
        input.type = "text"
        icon.classList.remove("fa-eye")
        icon.classList.add("fa-eye-slash")
      } else {
        input.type = "password"
        icon.classList.remove("fa-eye-slash")
        icon.classList.add("fa-eye")
      }
    })
  })

  // Password strength checker
  const registerPassword = document.getElementById("registerPassword")
  const strengthBar = document.querySelector(".strength-fill")
  const strengthText = document.querySelector(".strength-text")

  if (registerPassword) {
    registerPassword.addEventListener("input", function () {
      const password = this.value
      const strength = checkPasswordStrength(password)

      strengthBar.className = "strength-fill " + strength.class
      strengthText.textContent = strength.text
    })
  }

  function checkPasswordStrength(password) {
    if (password.length < 6) {
      return { class: "", text: "Password terlalu pendek" }
    } else if (password.length < 8) {
      return { class: "weak", text: "Password lemah" }
    } else if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
      return { class: "strong", text: "Password kuat" }
    } else {
      return { class: "medium", text: "Password sedang" }
    }
  }

  // Login form submission
  const loginForm = document.getElementById("loginForm")

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const email = document.getElementById("loginEmail").value
      const password = document.getElementById("loginPassword").value
      const rememberMe = document.getElementById("rememberMe").checked

      // Simulate login process
      showMessage("Sedang memproses login...", "info")

      setTimeout(() => {
        // Check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem("users")) || []
        const user = users.find((u) => u.email === email && u.password === password)

        if (user) {
          // Login successful
          const loginData = {
            user: user,
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe,
          }

          localStorage.setItem("currentUser", JSON.stringify(loginData))

          showMessage("Login berhasil! Mengalihkan...", "success")

          setTimeout(() => {
            // Redirect to dashboard or previous page
            const returnUrl = new URLSearchParams(window.location.search).get("return") || "pesanan-saya.html"
            window.location.href = returnUrl
          }, 1500)
        } else {
          showMessage("Email atau password salah!", "error")
        }
      }, 1000)
    })
  }

  // Register form submission
  const registerForm = document.getElementById("registerForm")

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const name = document.getElementById("registerName").value
      const email = document.getElementById("registerEmail").value
      const phone = document.getElementById("registerPhone").value
      const password = document.getElementById("registerPassword").value
      const confirmPassword = document.getElementById("confirmPassword").value
      const agreeTerms = document.getElementById("agreeTerms").checked

      // Validation
      if (password !== confirmPassword) {
        showMessage("Password dan konfirmasi password tidak sama!", "error")
        return
      }

      if (password.length < 6) {
        showMessage("Password minimal 6 karakter!", "error")
        return
      }

      if (!agreeTerms) {
        showMessage("Anda harus menyetujui syarat dan ketentuan!", "error")
        return
      }

      // Check if email already exists
      const users = JSON.parse(localStorage.getItem("users")) || []
      if (users.find((u) => u.email === email)) {
        showMessage("Email sudah terdaftar! Silakan gunakan email lain.", "error")
        return
      }

      // Show loading state
      const submitBtn = registerForm.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.textContent = "Mendaftar..."
      submitBtn.disabled = true

      // Simulate registration process
      setTimeout(() => {
        try {
          // Create new user
          const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone,
            password: password,
            registrationDate: new Date().toISOString(),
            isActive: true,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B4513&color=fff`,
          }

          users.push(newUser)
          localStorage.setItem("users", JSON.stringify(users))

          // Reset form
          registerForm.reset()

          // Show success message
          showMessage("🎉 Akun berhasil dibuat! Silakan login dengan akun baru Anda.", "success")

          // Reset button
          submitBtn.textContent = originalText
          submitBtn.disabled = false

          // Switch to login tab after 2 seconds
          setTimeout(() => {
            // Switch tab
            document.querySelector('[data-tab="login"]').click()

            // Pre-fill email and focus on password
            setTimeout(() => {
              document.getElementById("loginEmail").value = email
              document.getElementById("loginPassword").focus()

              // Show helpful message on login form
              showMessage("✅ Akun sudah siap! Masukkan password untuk login.", "info")
            }, 300)
          }, 2000)
        } catch (error) {
          console.error("Registration error:", error)
          showMessage("Terjadi kesalahan saat mendaftar. Silakan coba lagi.", "error")

          // Reset button
          submitBtn.textContent = originalText
          submitBtn.disabled = false
        }
      }, 1000)
    })
  }

  // Social login buttons
  const socialBtns = document.querySelectorAll(".social-btn")

  socialBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const provider = this.classList.contains("google") ? "Google" : "Facebook"
      showMessage(`Login dengan ${provider} akan segera tersedia!`, "info")
    })
  })

  // Show message function
  function showMessage(text, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll(".message")
    existingMessages.forEach((msg) => msg.remove())

    // Create new message
    const message = document.createElement("div")
    message.className = `message ${type}`
    message.innerHTML = `
    <div class="message-content">
      <span class="message-text">${text}</span>
      <button class="message-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `

    // Insert message at the top of active form
    const activeForm = document.querySelector(".auth-form.active")
    activeForm.insertBefore(message, activeForm.firstChild)

    // Auto remove message after 5 seconds (except for info messages)
    if (type !== "info") {
      setTimeout(() => {
        if (message.parentElement) {
          message.remove()
        }
      }, 5000)
    }

    // Scroll to top to show message
    activeForm.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Check if user is already logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (currentUser) {
    // User is already logged in, redirect to dashboard
    window.location.href = "pesanan-saya.html"
  }

  // Update cart count
  const cartCount = document.querySelector(".cart-count")
  if (cartCount) {
    const count = Number.parseInt(localStorage.getItem("cartCount")) || 0
    cartCount.textContent = count
  }
})
