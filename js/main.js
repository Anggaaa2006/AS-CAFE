document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in and update header
  updateHeaderForLoggedInUser()

  // Mobile Menu Toggle
  const hamburger = document.querySelector(".hamburger")
  const menu = document.querySelector(".menu")

  if (hamburger && menu) {
    hamburger.addEventListener("click", () => {
      menu.classList.toggle("active")
      document.body.classList.toggle("menu-open")
    })
  }

  // Smooth Scrolling for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        e.preventDefault()
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: "smooth",
        })

        // Close mobile menu if open
        if (menu.classList.contains("active")) {
          menu.classList.remove("active")
          document.body.classList.remove("menu-open")
        }
      }
    })
  })

  // Header Scroll Effect
  const header = document.querySelector("header")

  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) {
        header.classList.add("scrolled")
      } else {
        header.classList.remove("scrolled")
      }
    })
  }

  // Add to Cart Functionality
  const addToCartButtons = document.querySelectorAll(".add-to-cart")
  const cartCount = document.querySelector(".cart-count")

  if (addToCartButtons.length > 0 && cartCount) {
    let count = Number.parseInt(localStorage.getItem("cartCount")) || 0
    cartCount.textContent = count

    addToCartButtons.forEach((button) => {
      button.addEventListener("click", function () {
        count++
        cartCount.textContent = count
        localStorage.setItem("cartCount", count)

        // Get product info
        const productCard = this.closest(".product-card")
        const productName = productCard.querySelector("h3").textContent
        const productPrice = productCard.querySelector(".product-price").textContent
        const productImage = productCard.querySelector("img").src

        // Add to cart in localStorage
        const cartItems = JSON.parse(localStorage.getItem("cartItems")) || []
        cartItems.push({
          name: productName,
          price: productPrice,
          image: productImage,
          quantity: 1,
        })
        localStorage.setItem("cartItems", JSON.stringify(cartItems))

        // Show notification
        showNotification(`${productName} ditambahkan ke keranjang!`)
      })
    })
  }

  // Reservation Form Submission
  const reservationForm = document.getElementById("reservationForm")

  if (reservationForm) {
    reservationForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Get form data
      const formData = new FormData(this)
      const reservationData = {}

      for (const [key, value] of formData.entries()) {
        reservationData[key] = value
      }

      // Store reservation data
      const reservations = JSON.parse(localStorage.getItem("reservations")) || []
      reservations.push(reservationData)
      localStorage.setItem("reservations", JSON.stringify(reservations))

      // Show confirmation
      showNotification("Reservasi berhasil dibuat! Kami akan menghubungi Anda untuk konfirmasi.")

      // Reset form
      this.reset()
    })
  }

  // Newsletter Form Submission
  const newsletterForm = document.querySelector(".newsletter-form")

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const email = this.querySelector('input[type="email"]').value

      // Store email
      const subscribers = JSON.parse(localStorage.getItem("subscribers")) || []
      subscribers.push(email)
      localStorage.setItem("subscribers", JSON.stringify(subscribers))

      // Show confirmation
      showNotification("Terima kasih telah berlangganan newsletter kami!")

      // Reset form
      this.reset()
    })
  }

  // Update header for logged in user
  function updateHeaderForLoggedInUser() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    const userIcon = document.querySelector(".user-icon")

    if (currentUser && userIcon) {
      // Update user icon to show logged in state
      userIcon.innerHTML = `
        <div class="user-dropdown">
          <img src="${currentUser.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.user.name)}&background=8B4513&color=fff`}" 
               alt="${currentUser.user.name}" class="user-avatar">
          <div class="dropdown-menu">
            <div class="user-info">
              <strong>${currentUser.user.name}</strong>
              <small>${currentUser.user.email}</small>
            </div>
            <a href="pesanan-saya.html"><i class="fas fa-user"></i> Dashboard</a>
            <a href="history-transaksi.html"><i class="fas fa-history"></i> Riwayat</a>
            <a href="#" id="headerLogout"><i class="fas fa-sign-out-alt"></i> Logout</a>
          </div>
        </div>
      `

      // Add logout functionality to header
      const headerLogout = document.getElementById("headerLogout")
      if (headerLogout) {
        headerLogout.addEventListener("click", (e) => {
          e.preventDefault()

          if (confirm("Apakah Anda yakin ingin logout?")) {
            localStorage.removeItem("currentUser")
            showNotification("Logout berhasil!")

            setTimeout(() => {
              window.location.reload()
            }, 1500)
          }
        })
      }
    }
  }

  // Notification Function
  function showNotification(message) {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = "notification"
    notification.textContent = message

    // Add to DOM
    document.body.appendChild(notification)

    // Show notification
    setTimeout(() => {
      notification.classList.add("show")
    }, 10)

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  // Add notification styles
  const notificationStyles = document.createElement("style")
  notificationStyles.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #c8a97e;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            transform: translateY(100px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            z-index: 1000;
        }
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }

        .user-dropdown {
            position: relative;
            display: inline-block;
        }

        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
        }

        .dropdown-menu {
            display: none;
            position: absolute;
            right: 0;
            top: 100%;
            background: white;
            min-width: 200px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            border-radius: 8px;
            padding: 10px 0;
            z-index: 1000;
        }

        .user-dropdown:hover .dropdown-menu {
            display: block;
        }

        .dropdown-menu .user-info {
            padding: 10px 15px;
            border-bottom: 1px solid #eee;
            margin-bottom: 5px;
        }

        .dropdown-menu .user-info strong {
            display: block;
            color: #333;
        }

        .dropdown-menu .user-info small {
            color: #666;
        }

        .dropdown-menu a {
            display: block;
            padding: 8px 15px;
            color: #333;
            text-decoration: none;
            transition: background-color 0.2s;
        }

        .dropdown-menu a:hover {
            background-color: #f5f5f5;
        }

        .dropdown-menu a i {
            margin-right: 8px;
            width: 16px;
        }
    `
  document.head.appendChild(notificationStyles)
})