document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  if (!currentUser) {
    // User not logged in, redirect to login
    window.location.href = "login.html"
    return
  }

  // Display user info
  const userNameElement = document.getElementById("userName")
  const userEmailElement = document.getElementById("userEmail")
  const userAvatarElement = document.getElementById("userAvatar")

  if (userNameElement) userNameElement.textContent = currentUser.user.name
  if (userEmailElement) userEmailElement.textContent = currentUser.user.email
  if (userAvatarElement) {
    userAvatarElement.src =
      currentUser.user.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.user.name)}&background=8B4513&color=fff`
  }

  // Logout functionality
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()

      // Show confirmation dialog
      if (confirm("Apakah Anda yakin ingin logout?")) {
        // Clear user data
        localStorage.removeItem("currentUser")

        // Show logout message
        showNotification("Logout berhasil! Mengalihkan ke halaman utama...", "success")

        // Redirect to home page after 1.5 seconds
        setTimeout(() => {
          window.location.href = "index.html"
        }, 1500)
      }
    })
  }

  // Tab navigation
  const tabLinks = document.querySelectorAll(".dashboard-nav a")
  const tabContents = document.querySelectorAll(".tab-content")

  tabLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const targetTab = link.getAttribute("data-tab")

      // Remove active class from all tabs and links
      tabLinks.forEach((l) => l.parentElement.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to clicked link and corresponding content
      link.parentElement.classList.add("active")
      document.getElementById(targetTab).classList.add("active")

      // Load content based on tab
      switch (targetTab) {
        case "orders":
          loadUserOrders()
          break
        case "reservations":
          loadUserReservations()
          break
        case "profile":
          loadProfile()
          break
        case "favorites":
          loadFavorites()
          break
      }
    })
  })

  // Load user info
  loadUserInfo()

  // Load initial content
  loadUserOrders()

  // Order status filter
  const statusFilter = document.getElementById("orderStatusFilter")
  if (statusFilter) {
    statusFilter.addEventListener("change", loadUserOrders)
  }

  function loadUserInfo() {
    // Load from localStorage or use default
    const userInfo = JSON.parse(
      localStorage.getItem("userInfo") || '{"name": "Guest User", "email": "guest@example.com"}',
    )

    document.getElementById("userName").textContent = userInfo.name
    document.getElementById("userEmail").textContent = userInfo.email
  }

  function loadUserOrders() {
    const orders = JSON.parse(localStorage.getItem("orders")) || []
    const userOrders = orders.filter((order) => order.userEmail === currentUser.user.email)

    const ordersContainer = document.getElementById("ordersContainer")
    if (!ordersContainer) return

    if (userOrders.length === 0) {
      ordersContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-shopping-bag"></i>
          <h3>Belum Ada Pesanan</h3>
          <p>Anda belum memiliki pesanan. Mulai berbelanja sekarang!</p>
          <a href="menu.html" class="btn btn-primary">Lihat Menu</a>
        </div>
      `
      return
    }

    ordersContainer.innerHTML = userOrders
      .map(
        (order) => `
      <div class="order-card">
        <div class="order-header">
          <div class="order-info">
            <h3>Pesanan #${order.id}</h3>
            <p class="order-date">${new Date(order.date).toLocaleDateString("id-ID")}</p>
          </div>
          <div class="order-status ${order.status}">
            <span class="status-text">${getStatusText(order.status)}</span>
          </div>
        </div>
        <div class="order-items">
          ${order.items
            .map(
              (item) => `
            <div class="order-item">
              <img src="${item.image}" alt="${item.name}">
              <div class="item-details">
                <h4>${item.name}</h4>
                <p>Qty: ${item.quantity}</p>
              </div>
              <div class="item-price">${item.price}</div>
            </div>
          `,
            )
            .join("")}
        </div>
        <div class="order-footer">
          <div class="order-total">
            <strong>Total: ${order.total}</strong>
          </div>
          <div class="order-actions">
            ${getOrderActions(order)}
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  function createOrderElement(order) {
    const orderDiv = document.createElement("div")
    orderDiv.className = "order-item"

    const orderDate = new Date(order.orderDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    let itemsHTML = ""
    order.items.forEach((item) => {
      itemsHTML += `
        <div class="order-item-detail">
          <span class="item-name">${item.name}</span>
          <span class="item-quantity">x${item.quantity}</span>
          <span class="item-price">${item.price}</span>
        </div>
      `
    })

    const statusText = getStatusText(order.status)
    const actionButtons = getOrderActionButtons(order)

    orderDiv.innerHTML = `
      <div class="order-header">
        <div>
          <div class="order-id">Pesanan #${order.orderId}</div>
          <div class="order-date">${orderDate}</div>
        </div>
        <div class="order-status ${order.status}">${statusText}</div>
      </div>
      
      <div class="order-items">
        ${itemsHTML}
      </div>
      
      <div class="order-footer">
        <div class="order-total">Total: ${order.total}</div>
        <div class="order-actions">
          ${actionButtons}
        </div>
      </div>
    `

    return orderDiv
  }

  function getStatusText(status) {
    const statusMap = {
      pending: "Menunggu Konfirmasi",
      confirmed: "Dikonfirmasi",
      preparing: "Sedang Disiapkan",
      ready: "Siap Diambil",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    }
    return statusMap[status] || status
  }

  function getOrderActionButtons(order) {
    let buttons = ""

    if (order.status === "pending") {
      buttons += `<button class="btn btn-primary btn-sm" onclick="payOrder('${order.orderId}')">Bayar</button>`
      buttons += `<button class="btn btn-danger btn-sm" onclick="cancelOrder('${order.orderId}')">Batal</button>`
    } else if (order.status === "ready") {
      buttons += `<button class="btn btn-success btn-sm" onclick="confirmPickup('${order.orderId}')">Sudah Diambil</button>`
    } else if (order.status === "completed") {
      buttons += `<button class="btn btn-secondary btn-sm" onclick="reorderItems('${order.orderId}')">Pesan Lagi</button>`
      buttons += `<button class="btn btn-outline btn-sm" onclick="downloadReceipt('${order.orderId}')">Unduh Struk</button>`
    }

    buttons += `<button class="btn btn-outline btn-sm" onclick="viewOrderDetail('${order.orderId}')">Detail</button>`

    return buttons
  }

  function getOrderActions(order) {
    switch (order.status) {
      case "pending":
        return `
          <button class="btn btn-sm btn-outline" onclick="cancelOrder('${order.id}')">Batalkan</button>
          <button class="btn btn-sm btn-primary" onclick="payOrder('${order.id}')">Bayar</button>
        `
      case "ready":
        return `<button class="btn btn-sm btn-primary" onclick="confirmPickup('${order.id}')">Konfirmasi Pickup</button>`
      case "completed":
        return `
          <button class="btn btn-sm btn-outline" onclick="reorder('${order.id}')">Pesan Lagi</button>
          <button class="btn btn-sm btn-secondary" onclick="downloadReceipt('${order.id}')">Download Struk</button>
        `
      default:
        return ""
    }
  }

  function loadUserReservations() {
    const reservations = JSON.parse(localStorage.getItem("reservations")) || []
    const userReservations = reservations.filter((res) => res.email === currentUser.user.email)

    const reservationsContainer = document.getElementById("reservationsContainer")
    if (!reservationsContainer) return

    if (userReservations.length === 0) {
      reservationsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-calendar-alt"></i>
          <h3>Belum Ada Reservasi</h3>
          <p>Anda belum memiliki reservasi meja.</p>
          <a href="reservasi.html" class="btn btn-primary">Reservasi Sekarang</a>
        </div>
      `
      return
    }

    reservationsContainer.innerHTML = userReservations
      .map(
        (res, index) => `
      <div class="reservation-card">
        <div class="reservation-header">
          <h3>Reservasi #${index + 1}</h3>
          <span class="reservation-status confirmed">Dikonfirmasi</span>
        </div>
        <div class="reservation-details">
          <div class="detail-item">
            <i class="fas fa-calendar"></i>
            <span>${res.date}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-clock"></i>
            <span>${res.time}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-users"></i>
            <span>${res.guests} orang</span>
          </div>
          ${
            res.notes
              ? `
            <div class="detail-item">
              <i class="fas fa-sticky-note"></i>
              <span>${res.notes}</span>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `,
      )
      .join("")
  }

  function createReservationElement(reservation) {
    const reservationDiv = document.createElement("div")
    reservationDiv.className = "reservation-item"

    const reservationDate = new Date(reservation.timestamp).toLocaleDateString("id-ID")

    reservationDiv.innerHTML = `
      <div class="reservation-header">
        <div class="reservation-id">Reservasi #${reservation.reservationId}</div>
        <div class="order-status ${reservation.status}">${getStatusText(reservation.status)}</div>
      </div>
      
      <div class="reservation-details">
        <div class="detail-item">
          <i class="fas fa-calendar"></i>
          <span>${reservation.date} - ${reservation.time}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-users"></i>
          <span>${reservation.guests} Tamu</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-table"></i>
          <span>Meja ${reservation.table?.number || "TBD"}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-user"></i>
          <span>${reservation.name}</span>
        </div>
      </div>
      
      <div class="order-actions">
        <button class="btn btn-outline btn-sm" onclick="viewReservationDetail('${reservation.reservationId}')">Detail</button>
        ${
          reservation.status === "pending"
            ? `<button class="btn btn-danger btn-sm" onclick="cancelReservation('${reservation.reservationId}')">Batal</button>`
            : ""
        }
      </div>
    `

    return reservationDiv
  }

  function loadProfile() {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}")

    document.getElementById("profileName").value = userInfo.name || ""
    document.getElementById("profileEmail").value = userInfo.email || ""
    document.getElementById("profilePhone").value = userInfo.phone || ""
    document.getElementById("profileBirthdate").value = userInfo.birthdate || ""
    document.getElementById("profileAddress").value = userInfo.address || ""
  }

  function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    const favoritesList = document.getElementById("favoritesList")
    const favoritesEmpty = document.getElementById("favoritesEmpty")

    if (favorites.length === 0) {
      favoritesList.style.display = "none"
      favoritesEmpty.style.display = "block"
      return
    }

    favoritesList.style.display = "grid"
    favoritesEmpty.style.display = "none"

    favoritesList.innerHTML = ""

    favorites.forEach((item) => {
      const favoriteElement = createFavoriteElement(item)
      favoritesList.appendChild(favoriteElement)
    })
  }

  function createFavoriteElement(item) {
    const favoriteDiv = document.createElement("div")
    favoriteDiv.className = "favorite-item"

    favoriteDiv.innerHTML = `
      <div class="favorite-image">
        <i class="fas fa-coffee"></i>
      </div>
      <div class="favorite-info">
        <div class="favorite-name">${item.name}</div>
        <div class="favorite-price">${item.price}</div>
        <div class="favorite-actions">
          <button class="btn btn-primary btn-sm" onclick="addToCart('${item.id}')">Tambah ke Keranjang</button>
          <button class="btn btn-outline btn-sm" onclick="removeFavorite('${item.id}')">Hapus</button>
        </div>
      </div>
    `

    return favoriteDiv
  }

  // Profile form submission
  const profileForm = document.getElementById("profileForm")
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const formData = new FormData(profileForm)
      const userInfo = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        birthdate: formData.get("birthdate"),
        address: formData.get("address"),
      }

      localStorage.setItem("userInfo", JSON.stringify(userInfo))
      loadUserInfo()

      showNotification("Profil berhasil diperbarui!")
    })
  }
})

// Global functions for order actions
window.cancelOrder = (orderId) => {
  if (confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
    const orders = JSON.parse(localStorage.getItem("orders")) || []
    const orderIndex = orders.findIndex((order) => order.id === orderId)

    if (orderIndex !== -1) {
      orders[orderIndex].status = "cancelled"
      localStorage.setItem("orders", JSON.stringify(orders))
      loadUserOrders()
      showNotification("Pesanan berhasil dibatalkan", "success")
    }
  }
}

window.payOrder = (orderId) => {
  // Redirect to payment page
  window.location.href = `pembayaran.html?orderId=${orderId}`
}

window.confirmPickup = (orderId) => {
  const orders = JSON.parse(localStorage.getItem("orders")) || []
  const orderIndex = orders.findIndex((order) => order.id === orderId)

  if (orderIndex !== -1) {
    orders[orderIndex].status = "completed"
    localStorage.setItem("orders", JSON.stringify(orders))
    loadUserOrders()
    showNotification("Terima kasih! Pesanan telah selesai", "success")
  }
}

window.reorder = (orderId) => {
  const orders = JSON.parse(localStorage.getItem("orders")) || []
  const order = orders.find((order) => order.id === orderId)

  if (order) {
    // Add items to cart
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || []
    order.items.forEach((item) => {
      cartItems.push(item)
    })
    localStorage.setItem("cartItems", JSON.stringify(cartItems))

    // Update cart count
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
    localStorage.setItem("cartCount", cartCount)

    showNotification("Item berhasil ditambahkan ke keranjang!", "success")
  }
}

function viewOrderDetail(orderId) {
  // Implement order detail view
  alert(`Melihat detail pesanan: ${orderId}`)
}

window.downloadReceipt = (orderId) => {
  showNotification("Fitur download struk akan segera tersedia!", "info")
}

function cancelReservation(reservationId) {
  if (confirm("Apakah Anda yakin ingin membatalkan reservasi ini?")) {
    const reservations = JSON.parse(localStorage.getItem("reservations") || "[]")
    const reservationIndex = reservations.findIndex((r) => r.reservationId === reservationId)

    if (reservationIndex !== -1) {
      reservations[reservationIndex].status = "cancelled"
      localStorage.setItem("reservations", JSON.stringify(reservations))
      location.reload()
    }
  }
}

function viewReservationDetail(reservationId) {
  alert(`Melihat detail reservasi: ${reservationId}`)
}

function addToCart(itemId) {
  showNotification("Item berhasil ditambahkan ke keranjang!")
}

function removeFavorite(itemId) {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
  const updatedFavorites = favorites.filter((item) => item.id !== itemId)
  localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
  location.reload()
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.classList.add("show")
  }, 10)

  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Update cart count
const cartCount = document.querySelector(".cart-count")
if (cartCount) {
  const count = Number.parseInt(localStorage.getItem("cartCount")) || 0
  cartCount.textContent = count
}

