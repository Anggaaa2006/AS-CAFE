// Notification System for AS CAFE Admin
class NotificationSystem {
  constructor() {
    this.notifications = this.getNotifications()
    this.init()
  }

  init() {
    this.updateNotificationBadge()
    this.setupEventListeners()
    this.startPeriodicCheck()
  }

  setupEventListeners() {
    // Bell icon click handler
    const bellIcon = document.getElementById("notificationBell")
    if (bellIcon) {
      bellIcon.addEventListener("click", () => this.toggleNotificationPanel())
    }

    // Close notification panel when clicking outside
    document.addEventListener("click", (e) => {
      const panel = document.getElementById("notificationPanel")
      const bell = document.getElementById("notificationBell")

      if (panel && !panel.contains(e.target) && !bell.contains(e.target)) {
        panel.style.display = "none"
      }
    })
  }

  // Generate notifications based on system events
  checkForNewNotifications() {
    const newNotifications = []

    // Check for new orders
    const orders = adminData.getOrders()
    const recentOrders = orders.filter((order) => {
      const orderTime = new Date(order.createdAt)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return orderTime > fiveMinutesAgo && order.status === "pending"
    })

    recentOrders.forEach((order) => {
      const notificationId = `order_${order.id}_${Date.now()}`
      if (!this.notifications.find((n) => n.relatedId === order.id && n.type === "new_order")) {
        newNotifications.push({
          id: notificationId,
          type: "new_order",
          title: "Pesanan Baru",
          message: `Pesanan dari ${order.customerName} - Meja ${order.tableNumber}`,
          timestamp: new Date().toISOString(),
          read: false,
          relatedId: order.id,
          relatedType: "order",
          action: "admin-orders.html",
          icon: "fas fa-shopping-cart",
          priority: "high",
        })
      }
    })

    // Check for new reservations
    const reservations = adminData.getReservations()
    const recentReservations = reservations.filter((reservation) => {
      const reservationTime = new Date(reservation.createdAt)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
      return reservationTime > tenMinutesAgo && reservation.status === "pending"
    })

    recentReservations.forEach((reservation) => {
      const notificationId = `reservation_${reservation.id}_${Date.now()}`
      if (!this.notifications.find((n) => n.relatedId === reservation.id && n.type === "new_reservation")) {
        newNotifications.push({
          id: notificationId,
          type: "new_reservation",
          title: "Reservasi Baru",
          message: `Reservasi dari ${reservation.customerName} untuk ${reservation.guests} orang`,
          timestamp: new Date().toISOString(),
          read: false,
          relatedId: reservation.id,
          relatedType: "reservation",
          action: "admin-reservations.html",
          icon: "fas fa-calendar-plus",
          priority: "medium",
        })
      }
    })

    // Check for orders ready to serve
    const readyOrders = orders.filter((order) => order.status === "ready")
    readyOrders.forEach((order) => {
      const notificationId = `ready_${order.id}_${Date.now()}`
      if (!this.notifications.find((n) => n.relatedId === order.id && n.type === "order_ready")) {
        newNotifications.push({
          id: notificationId,
          type: "order_ready",
          title: "Pesanan Siap",
          message: `Pesanan ${order.customerName} siap disajikan - Meja ${order.tableNumber}`,
          timestamp: new Date().toISOString(),
          read: false,
          relatedId: order.id,
          relatedType: "order",
          action: "admin-orders.html",
          icon: "fas fa-check-circle",
          priority: "high",
        })
      }
    })

    // Check for low stock items (if implemented)
    const menu = adminData.getMenu()
    const lowStockItems = menu.filter((item) => item.stock && item.stock < 5)
    lowStockItems.forEach((item) => {
      const notificationId = `stock_${item.id}_${Date.now()}`
      if (!this.notifications.find((n) => n.relatedId === item.id && n.type === "low_stock")) {
        newNotifications.push({
          id: notificationId,
          type: "low_stock",
          title: "Stok Menipis",
          message: `${item.name} tersisa ${item.stock || 0} porsi`,
          timestamp: new Date().toISOString(),
          read: false,
          relatedId: item.id,
          relatedType: "menu",
          action: "admin-menu.html",
          icon: "fas fa-exclamation-triangle",
          priority: "medium",
        })
      }
    })

    // Add new notifications
    if (newNotifications.length > 0) {
      this.notifications = [...newNotifications, ...this.notifications]
      this.saveNotifications()
      this.updateNotificationBadge()
      this.showToastNotification(newNotifications[0])
    }
  }

  // Show toast notification for new notifications
  showToastNotification(notification) {
    const toast = document.createElement("div")
    toast.className = `toast-notification ${notification.priority}`
    toast.innerHTML = `
      <div class="toast-content">
        <i class="${notification.icon}"></i>
        <div class="toast-text">
          <strong>${notification.title}</strong>
          <p>${notification.message}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `

    document.body.appendChild(toast)

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove()
      }
    }, 5000)

    // Add click handler to navigate
    toast.addEventListener("click", () => {
      if (notification.action) {
        window.location.href = notification.action
      }
    })
  }

  // Toggle notification panel
  toggleNotificationPanel() {
    const panel = document.getElementById("notificationPanel")
    if (!panel) {
      this.createNotificationPanel()
    } else {
      panel.style.display = panel.style.display === "none" ? "block" : "none"
    }
    this.renderNotifications()
  }

  // Create notification panel HTML
  createNotificationPanel() {
    const panel = document.createElement("div")
    panel.id = "notificationPanel"
    panel.className = "notification-panel"
    panel.innerHTML = `
      <div class="notification-header">
        <h3>Notifikasi</h3>
        <div class="notification-actions">
          <button onclick="notificationSystem.markAllAsRead()" class="btn-link">
            Tandai Semua Dibaca
          </button>
          <button onclick="notificationSystem.clearAllNotifications()" class="btn-link text-danger">
            Hapus Semua
          </button>
        </div>
      </div>
      <div class="notification-list" id="notificationList">
        <!-- Notifications will be rendered here -->
      </div>
      <div class="notification-footer">
        <a href="admin-notifications.html" class="btn btn-primary btn-sm">
          Lihat Semua Notifikasi
        </a>
      </div>
    `

    // Position the panel relative to the bell icon
    const bellIcon = document.getElementById("notificationBell")
    const rect = bellIcon.getBoundingClientRect()
    panel.style.position = "fixed"
    panel.style.top = rect.bottom + 10 + "px"
    panel.style.right = "20px"
    panel.style.display = "block"

    document.body.appendChild(panel)
  }

  // Render notifications in the panel
  renderNotifications() {
    const listContainer = document.getElementById("notificationList")
    if (!listContainer) return

    const recentNotifications = this.notifications.slice(0, 10) // Show only recent 10

    if (recentNotifications.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-notifications">
          <i class="fas fa-bell-slash"></i>
          <p>Tidak ada notifikasi</p>
        </div>
      `
      return
    }

    listContainer.innerHTML = recentNotifications
      .map(
        (notification) => `
      <div class="notification-item ${notification.read ? "read" : "unread"}" 
           onclick="notificationSystem.handleNotificationClick('${notification.id}')">
        <div class="notification-icon ${notification.priority}">
          <i class="${notification.icon}"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">${notification.title}</div>
          <div class="notification-message">${notification.message}</div>
          <div class="notification-time">${this.formatTimeAgo(notification.timestamp)}</div>
        </div>
        ${!notification.read ? '<div class="unread-dot"></div>' : ""}
      </div>
    `,
      )
      .join("")
  }

  // Handle notification click
  handleNotificationClick(notificationId) {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification) {
      // Mark as read
      notification.read = true
      this.saveNotifications()
      this.updateNotificationBadge()

      // Navigate to related page
      if (notification.action) {
        window.location.href = notification.action
      }

      // Close panel
      const panel = document.getElementById("notificationPanel")
      if (panel) {
        panel.style.display = "none"
      }
    }
  }

  // Update notification badge count
  updateNotificationBadge() {
    const badge = document.getElementById("notificationBadge")
    const unreadCount = this.notifications.filter((n) => !n.read).length

    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? "99+" : unreadCount
        badge.style.display = "block"
      } else {
        badge.style.display = "none"
      }
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach((n) => (n.read = true))
    this.saveNotifications()
    this.updateNotificationBadge()
    this.renderNotifications()
  }

  // Clear all notifications
  clearAllNotifications() {
    if (confirm("Apakah Anda yakin ingin menghapus semua notifikasi?")) {
      this.notifications = []
      this.saveNotifications()
      this.updateNotificationBadge()
      this.renderNotifications()
    }
  }

  // Format time ago
  formatTimeAgo(timestamp) {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)

    if (diffInSeconds < 60) return "Baru saja"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`
    return `${Math.floor(diffInSeconds / 86400)} hari lalu`
  }

  // Start periodic check for new notifications
  startPeriodicCheck() {
    // Check every 30 seconds
    setInterval(() => {
      this.checkForNewNotifications()
    }, 30000)

    // Initial check
    this.checkForNewNotifications()
  }

  // Storage methods
  getNotifications() {
    return JSON.parse(localStorage.getItem("asCafeNotifications") || "[]")
  }

  saveNotifications() {
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100)
    }
    localStorage.setItem("asCafeNotifications", JSON.stringify(this.notifications))
  }

  // Manual trigger for testing
  addTestNotification() {
    const testNotification = {
      id: `test_${Date.now()}`,
      type: "test",
      title: "Test Notification",
      message: "This is a test notification",
      timestamp: new Date().toISOString(),
      read: false,
      relatedId: null,
      relatedType: "test",
      action: null,
      icon: "fas fa-info-circle",
      priority: "low",
    }

    this.notifications.unshift(testNotification)
    this.saveNotifications()
    this.updateNotificationBadge()
    this.showToastNotification(testNotification)
  }
}

// Initialize notification system
let notificationSystem
let adminData // Declare adminData
document.addEventListener("DOMContentLoaded", () => {
  notificationSystem = new NotificationSystem()
})
